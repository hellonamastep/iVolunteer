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
  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth-token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await api.get('/v1/auth/certificates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCertificates(response.data.certificates || []);
      }
    } catch (error: any) {
      console.error('Error fetching certificates:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificate: Certificate) => {
    try {
      setDownloading(true);
      
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      const { createRoot } = await import('react-dom/client');
      
      // Create a hidden container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Render the fixed-size certificate
      const root = createRoot(container);
      root.render(<CertificateForDownload certificate={certificate} />);

      // Wait for rendering
      await new Promise(resolve => setTimeout(resolve, 500));

      const certElement = container.firstChild as HTMLElement;

      const canvas = await html2canvas(certElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        width: 1200,
        height: 900,
      });

      // Cleanup
      root.unmount();
      document.body.removeChild(container);

      const link = document.createElement('a');
      link.download = `Certificate_${certificate.eventTitle.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      toast.error('Failed to download certificate');
    } finally {
      setDownloading(false);
    }
  };

  const CertificateForDownload: React.FC<{ certificate: Certificate }> = ({ certificate }) => (
    <div
      style={{ 
        width: '1200px',
        height: '900px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
        padding: '60px',
        borderRadius: '16px',
        border: '8px double #7DD9A6',
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      {/* Decorative corners */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '128px', 
        height: '128px', 
        borderTop: '8px solid #6BC794', 
        borderLeft: '8px solid #6BC794',
        borderTopLeftRadius: '16px'
      }}></div>
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        right: 0, 
        width: '128px', 
        height: '128px', 
        borderTop: '8px solid #6BC794', 
        borderRight: '8px solid #6BC794',
        borderTopRightRadius: '16px'
      }}></div>
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        width: '128px', 
        height: '128px', 
        borderBottom: '8px solid #6BC794', 
        borderLeft: '8px solid #6BC794',
        borderBottomLeftRadius: '16px'
      }}></div>
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        right: 0, 
        width: '128px', 
        height: '128px', 
        borderBottom: '8px solid #6BC794', 
        borderRight: '8px solid #6BC794',
        borderBottomRightRadius: '16px'
      }}></div>

      {/* Background pattern */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.05 }}>
        <div style={{ position: 'absolute', top: '80px', left: '80px', width: '160px', height: '160px', borderRadius: '50%', backgroundColor: '#7DD9A6' }}></div>
        <div style={{ position: 'absolute', bottom: '80px', right: '80px', width: '160px', height: '160px', borderRadius: '50%', backgroundColor: '#E8F5A5' }}></div>
      </div>

      <div style={{ 
        position: 'relative', 
        zIndex: 10, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingTop: '40px',
        paddingBottom: '40px',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ 
              borderRadius: '50%', 
              padding: '20px',
              background: 'linear-gradient(to right, #7DD9A6, #6BC794)',
              display: 'inline-block'
            }}>
              <Award style={{ width: '80px', height: '80px', color: '#ffffff' }} />
            </div>
          </div>
          <h1 style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937', margin: 0 }}>
            Certificate of Appreciation
          </h1>
          <div style={{ 
            width: '128px', 
            height: '4px',
            margin: '0 auto',
            borderRadius: '9999px',
            background: 'linear-gradient(to right, #7DD9A6, #6BC794)'
          }}></div>
        </div>

        {/* Body */}
        <div style={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', paddingLeft: '40px', paddingRight: '40px' }}>
          <p style={{ fontSize: '24px', color: '#4b5563', marginBottom: '30px' }}>This is to certify that</p>
          
          <div style={{ 
            borderRadius: '12px', 
            padding: '20px',
            border: '2px solid #7DD9A6',
            backgroundColor: 'rgba(232, 245, 165, 0.3)',
            marginBottom: '30px'
          }}>
            <h2 style={{ fontSize: '48px', fontWeight: 'bold', color: '#111827', margin: 0 }}>{certificate.volunteerName}</h2>
          </div>

          <p style={{ fontSize: '24px', color: '#4b5563', marginBottom: '30px' }}>has successfully completed volunteering at</p>

          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: '#6BC794', marginBottom: '10px' }}>{certificate.eventTitle}</h3>
            <p style={{ fontSize: '20px', color: '#4b5563' }}>
              Organized by <span style={{ fontWeight: 600, color: '#1f2937' }}>{certificate.organizationName}</span>
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', fontSize: '16px', color: '#4b5563', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar style={{ width: '20px', height: '20px', color: '#7DD9A6' }} />
              <span>{new Date(certificate.eventDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Medal style={{ width: '20px', height: '20px', color: '#7DD9A6' }} />
              <span>{certificate.pointsEarned} Points Earned</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '250px', marginBottom: '10px', borderTop: '2px solid #9ca3af' }}></div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>{certificate.organizationName}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Organization</p>
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '250px', marginBottom: '10px', borderTop: '2px solid #9ca3af' }}></div>
              <p style={{ fontSize: '16px', fontWeight: 600, color: '#374151', marginBottom: '5px' }}>{certificate.adminName}</p>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>Verified by Admin</p>
            </div>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Issued on {new Date(certificate.completedAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const CertificatePreview: React.FC<{ certificate: Certificate }> = ({ certificate }) => (
    <div
      ref={certificateRef}
      style={{ 
        maxWidth: '1000px', 
        minHeight: '500px',
        backgroundColor: '#ffffff',
        color: '#1f2937',
      }}
      className="p-8 md:p-12 rounded-2xl shadow-2xl border-8 border-double border-[#7DD9A6] relative overflow-hidden mx-auto"
    >
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-24 h-24 md:w-32 md:h-32 border-t-8 border-l-8 border-[#6BC794] rounded-tl-2xl"></div>
      <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 border-t-8 border-r-8 border-[#6BC794] rounded-tr-2xl"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 md:w-32 md:h-32 border-b-8 border-l-8 border-[#6BC794] rounded-bl-2xl"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 md:w-32 md:h-32 border-b-8 border-r-8 border-[#6BC794] rounded-br-2xl"></div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-40 h-40 rounded-full" style={{ backgroundColor: '#7DD9A6' }}></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 rounded-full" style={{ backgroundColor: '#E8F5A5' }}></div>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-between py-4 md:py-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="rounded-full p-3 md:p-4" style={{ background: 'linear-gradient(to right, #7DD9A6, #6BC794)' }}>
              <Award className="h-12 w-12 md:h-16 md:w-16" style={{ color: '#ffffff' }} />
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2" style={{ color: '#1f2937' }}>Certificate of Appreciation</h1>
          <div className="w-24 md:w-32 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, #7DD9A6, #6BC794)' }}></div>
        </div>

        {/* Body */}
        <div className="text-center space-y-4 md:space-y-6 flex-1 flex flex-col justify-center w-full px-4">
          <p className="text-lg md:text-xl" style={{ color: '#4b5563' }}>This is to certify that</p>
          
          <div className="rounded-xl p-3 md:p-4 border-2 border-[#7DD9A6]" style={{ backgroundColor: 'rgba(232, 245, 165, 0.3)' }}>
            <h2 className="text-2xl md:text-4xl font-bold" style={{ color: '#111827' }}>{certificate.volunteerName}</h2>
          </div>

          <p className="text-lg md:text-xl" style={{ color: '#4b5563' }}>has successfully completed volunteering at</p>

          <div className="space-y-2">
            <h3 className="text-2xl md:text-3xl font-bold" style={{ color: '#6BC794' }}>{certificate.eventTitle}</h3>
            <p className="text-base md:text-lg" style={{ color: '#4b5563' }}>
              Organized by <span className="font-semibold" style={{ color: '#1f2937' }}>{certificate.organizationName}</span>
            </p>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-4 md:gap-6 text-sm" style={{ color: '#4b5563' }}>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" style={{ color: '#7DD9A6' }} />
              <span>{new Date(certificate.eventDate).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Medal className="h-4 w-4" style={{ color: '#7DD9A6' }} />
              <span>{certificate.pointsEarned} Points Earned</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
            <div className="text-center">
              <div className="w-40 md:w-48 mb-2" style={{ borderTop: '2px solid #9ca3af' }}></div>
              <p className="text-sm font-semibold" style={{ color: '#374151' }}>{certificate.organizationName}</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>Organization</p>
            </div>
            
            <div className="text-center">
              <div className="w-40 md:w-48 mb-2" style={{ borderTop: '2px solid #9ca3af' }}></div>
              <p className="text-sm font-semibold" style={{ color: '#374151' }}>{certificate.adminName}</p>
              <p className="text-xs" style={{ color: '#6b7280' }}>Verified by Admin</p>
            </div>
          </div>
          
          <div className="text-center mt-4 md:mt-6">
            <p className="text-xs" style={{ color: '#6b7280' }}>
              Issued on {new Date(certificate.completedAt).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
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
              onClick={() => setSelectedCertificate(certificate)}
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
                      setSelectedCertificate(certificate);
                    }}
                    className="w-full bg-gradient-to-r from-[#7DD9A6] to-[#6BC794] hover:from-[#6BC794] hover:to-[#5AB583] text-white py-2 px-4 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>View Certificate</span>
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
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setSelectedCertificate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl my-8"
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
              <div className="bg-white rounded-2xl overflow-hidden">
                <CertificatePreview certificate={selectedCertificate} />
              </div>

              {/* Download button */}
              <div className="mt-4 flex justify-center">
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
