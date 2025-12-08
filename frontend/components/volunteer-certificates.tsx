'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Award, Download, Calendar, Building, User, CheckCircle, Loader2, Medal } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

interface Certificate {
  _id: string;
  eventTitle: string;
  eventDate: string;
  organizationName: string;
  volunteerName: string;
  adminName: string;
  completedAt: string;
  pointsEarned: number;
}

const VolunteerCertificates: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [isDownloadMode, setIsDownloadMode] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);
  const downloadButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  useEffect(() => {
    if (selectedCertificate && downloadButtonRef.current) {
      // Delay to ensure modal animation completes
      setTimeout(() => {
        downloadButtonRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 400);
    }
  }, [selectedCertificate]);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      
      // FOR TESTING: Add a default certificate (bypassing API completely for now)
      // REMOVE THIS SECTION LATER - START
      // console.log('🔴 TEST: Loading test certificate...');
      // const testCertificate: Certificate = {
      //   _id: 'test-certificate-001',
      //   eventTitle: 'Beach Cleanup Drive 2024',
      //   eventDate: '2024-11-15T10:00:00.000Z',
      //   organizationName: 'Green Earth Foundation',
      //   volunteerName: 'Test Volunteer',
      //   adminName: 'Admin Manager',
      //   completedAt: '2024-11-16T18:00:00.000Z',
      //   pointsEarned: 50,
      // };
      
      // // Simulate a slight delay like a real API call
      // await new Promise(resolve => setTimeout(resolve, 500));
      
      // setCertificates([testCertificate]);
      // console.log('TEST: Test certificate loaded successfully!', [testCertificate]);
      // 🔴 REMOVE THIS SECTION LATER - END
      
      // ✅ Original code (uncomment this when removing test certificate):
      
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await api.get('/v1/auth/certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data as any;
      if (data?.success) {
        setCertificates(data.certificates || []);
      }
      
    } catch (error: any) {
      console.error('Error fetching certificates:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const isMobile = () => {
    return window.innerWidth < 768;
  };

  const handleViewCertificate = (certificate: Certificate) => {
    if (isMobile()) {
      // On mobile, directly download without showing modal
      handleDownloadCertificate(certificate);
    } else {
      // On desktop, show the modal
      setSelectedCertificate(certificate);
    }
  };

  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      setDownloading(true);
      
      // Create a temporary hidden div to render the certificate
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '1086px';
      tempDiv.style.height = '768px';
      document.body.appendChild(tempDiv);

      // Create certificate element
      const certElement = document.createElement('div');
      certElement.style.width = '1086px';
      certElement.style.height = '768px';
      certElement.style.position = 'relative';
      certElement.style.backgroundImage = 'url(/images/Volunteer_Achievement_Certificate.png)';
      certElement.style.backgroundSize = 'cover';
      certElement.style.backgroundPosition = 'center';
      certElement.style.backgroundRepeat = 'no-repeat';

      // Add volunteer name
      const nameDiv = document.createElement('div');
      nameDiv.style.position = 'absolute';
      nameDiv.style.top = '280px';
      nameDiv.style.left = '50%';
      nameDiv.style.transform = 'translateX(-50%)';
      nameDiv.style.width = '60%';
      nameDiv.style.textAlign = 'center';
      nameDiv.innerHTML = `<h2 style="font-family: var(--font-great-vibes), 'Great Vibes', cursive; font-size: 64px; color: #1a1a4d; margin: 0; font-weight: 400; letter-spacing: 2px;">${certificate.volunteerName}</h2>`;
      certElement.appendChild(nameDiv);

      // Add event details
      const eventDiv = document.createElement('div');
      eventDiv.style.position = 'absolute';
      eventDiv.style.top = '380px';
      eventDiv.style.left = '50%';
      eventDiv.style.transform = 'translateX(-50%)';
      eventDiv.style.width = '70%';
      eventDiv.style.textAlign = 'center';
      eventDiv.innerHTML = `<p style="font-family: 'Times New Roman', serif; font-size: 18px; color: #1a1a4d; margin: 0; line-height: 1.6;">in recognition of outstanding volunteer service during<br />"${certificate.eventTitle}".<br />Your compassion and dedication have brought hope and<br />happiness to many lives.</p>`;
      certElement.appendChild(eventDiv);

      // Add organization name
      const orgDiv = document.createElement('div');
      orgDiv.style.position = 'absolute';
      orgDiv.style.bottom = '130px';
      orgDiv.style.left = '130px';
      orgDiv.style.textAlign = 'center';
      orgDiv.innerHTML = `<p style="font-family: 'Times New Roman', serif; font-size: 26px; color: #1a1a4d; margin: 0; font-weight: 600;">${certificate.organizationName}</p>`;
      certElement.appendChild(orgDiv);

      tempDiv.appendChild(certElement);

      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Import required libraries
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;

      const canvas = await html2canvas(certElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: null,
        allowTaint: true,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [1086, 768],
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', 0, 0, 1086, 768, '', 'FAST');

      // Download PDF
      pdf.save(`Certificate_${certificate.eventTitle.replace(/\s+/g, '_')}.pdf`);

      // Clean up
      document.body.removeChild(tempDiv);

      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const CertificatePreview: React.FC<{ certificate: Certificate }> = ({ certificate }) => (
    <div
      ref={certificateRef}
      style={{ 
        width: '1086px',
        maxWidth: '1086px',
        height: '768px',
        position: 'relative',
        backgroundImage: 'url(/images/Volunteer_Achievement_Certificate.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        margin: '0 auto',
      }}
      className="mx-auto"
    >
      {/* Certificate content overlay */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* Volunteer Name - positioned based on sample */}
        <div style={{
          position: 'absolute',
          top: isDownloadMode ? '280px' : '310px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          textAlign: 'center',
        }}>
          <h2 
            style={{ 
              fontFamily: "var(--font-great-vibes), 'Great Vibes', cursive",
              fontSize: '64px',
              color: '#1a1a4d',
              margin: 0,
              fontWeight: 400,
              letterSpacing: '2px',
            }}
          >
            {certificate.volunteerName}
          </h2>
        </div>

        {/* Event details - positioned based on sample */}
        <div style={{
          position: 'absolute',
          top: isDownloadMode ? '380px' : '400px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "'Times New Roman', serif",
            fontSize: '18px',
            color: '#1a1a4d',
            margin: 0,
            lineHeight: '1.6',
          }}>
            in recognition of outstanding volunteer service during<br />
            "{certificate.eventTitle}".<br />
            Your compassion and dedication have brought hope and<br />
            happiness to many lives.
          </p>
        </div>

        {/* Organization Name - bottom left */}
        <div style={{
          position: 'absolute',
          bottom: isDownloadMode ? '130px' : '110px',
          left: '130px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "'Times New Roman', serif",
            fontSize: '26px',
            color: '#1a1a4d',
            margin: 0,
            fontWeight: 600,
          }}>
            {certificate.organizationName}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 text-[#7DD9A6] animate-spin mb-4" />
            <p className="text-gray-600">Loading your certificates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-3 mb-3">
          <div className="bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] rounded-xl p-3">
            <Award className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">My Certificates</h2>
            <p className="text-gray-600">Celebrate your volunteer achievements</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Card */}
      {certificates.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] rounded-2xl p-6 mb-8 shadow-lg"
        >
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-white/80 text-sm font-medium">Total Certificates Earned</p>
              <p className="text-4xl font-bold">{certificates.length}</p>
            </div>
            <div className="bg-white/20 rounded-full p-4">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Certificates List */}
      {certificates.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12"
        >
          <div className="text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Award className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Certificates Yet</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Complete volunteer events and receive certificates once they're approved by the admin. 
              Start volunteering today to earn your first certificate! 🎉
            </p>
          </div>
        </motion.div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate, index) => (
            <motion.div
              key={certificate._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-[#7DD9A6] overflow-hidden group cursor-pointer"
              onClick={() => handleViewCertificate(certificate)}
            >
              {/* Certificate Preview Card */}
              <div className="relative h-48 bg-gradient-to-br from-[#E8F5A5] to-[#7DD9A6] p-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="bg-white rounded-full p-4 mb-3 mx-auto w-fit">
                    <Award className="h-12 w-12 text-[#6BC794]" />
                  </div>
                  <h3 className="text-white font-bold text-lg line-clamp-2">
                    {certificate.eventTitle}
                  </h3>
                </div>
                <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1">
                  <span className="text-xs font-semibold text-[#6BC794]">
                    +{certificate.pointsEarned} pts
                  </span>
                </div>
              </div>

              {/* Certificate Details */}
              <div className="p-4 space-y-3">
                <div className="flex items-start space-x-2">
                  <Building className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Organization</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {certificate.organizationName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Event Date</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(certificate.eventDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">Verified by</p>
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {certificate.adminName}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewCertificate(certificate);
                    }}
                    className="w-full bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] hover:from-[#6BC794] hover:to-[#5AB583] text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span className="md:hidden">Download Certificate</span>
                    <span className="hidden md:inline">View Certificate</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto pt-24 md:pt-28"
            onClick={() => setSelectedCertificate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedCertificate(null)}
                className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors z-10"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Certificate */}
              <div className="rounded-2xl overflow-hidden">
                <CertificatePreview certificate={selectedCertificate} />
              </div>

              {/* Download button */}
              <div ref={downloadButtonRef} className="mt-4 flex justify-center">
                <button
                  onClick={() => handleDownloadCertificate(selectedCertificate)}
                  disabled={downloading}
                  className="bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] hover:from-[#6BC794] hover:to-[#5AB583] text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      <span>Download Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VolunteerCertificates;
