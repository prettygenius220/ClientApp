import jsPDF from 'jspdf';

interface CertificateData {
  certificateNumber?: string;
  schoolName: string;
  instructor: string;
  courseTitle: string;
  courseNumber?: string;
  courseDate?: string;
  participantName: string;
  ceHours: number;
  issuedDate: string;
}

export function generateCertificatePdf(data: CertificateData): string {
  // Create new PDF document in landscape orientation
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add background image
  const backgroundUrl = 'https://ytjdouwglmlsnecjzzqg.supabase.co/storage/v1/object/sign/course-materials/RealEdu-CertificateBackground.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJjb3Vyc2UtbWF0ZXJpYWxzL1JlYWxFZHUtQ2VydGlmaWNhdGVCYWNrZ3JvdW5kLnBuZyIsImlhdCI6MTc0MDUyMTk3NywiZXhwIjoxNzcyMDU3OTc3fQ.izgF9xMUxx7AlQcsA3tFQcmgltoA4Jj1WOZK8AU8whU';
  doc.addImage(backgroundUrl, 'PNG', 0, 0, 297, 210); // A4 landscape dimensions

  // Add certificate content
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(36);
  doc.setTextColor(0, 128, 128);
  doc.text('Certificate of Completion', 148.5, 50, { align: 'center' });

  // Add course title with proper text wrapping
  doc.setFontSize(24);
  doc.setTextColor(50, 50, 50);
  const courseTitle = data.courseTitle;
  const maxWidth = 180; // Reduced maximum width for text in mm
  const lines = doc.splitTextToSize(courseTitle, maxWidth);
  
  // Adjust vertical position based on number of lines
  const titleY = lines.length > 1 ? 65 : 68;
  doc.text(lines, 148.5, titleY, { align: 'center' });

  // Add course number and date
  // Adjust vertical position based on course title length with less spacing
  const courseInfoY = titleY + (lines.length * 8) + 8;

  // Format course number properly - ensure it's displayed correctly and matches course
  let formattedCourseNumber = 'Course #N/A';
  if (data.courseNumber && data.courseNumber.trim() !== '') {
    formattedCourseNumber = `Course #${data.courseNumber}`;
  }
  doc.text(formattedCourseNumber, 148.5, courseInfoY, { align: 'center' });

  // Format course date
  let formattedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  if (data.courseDate && data.courseDate.trim() !== '') {
    formattedDate = data.courseDate;
  }
  doc.text(`Session Date: ${formattedDate}`, 148.5, courseInfoY + 8, { align: 'center' });

  // Add participant name
  doc.setFontSize(26); // Slightly smaller font size for participant name
  doc.setFont('helvetica', 'bold');

  // Ensure participant name is properly formatted and not empty
  let participantName = 'Certificate Recipient';
  if (data.participantName && data.participantName.trim() !== '') {
    participantName = data.participantName.trim();
  }

  // Wrap participant name if too long and ensure it fits on the page
  const participantLines = doc.splitTextToSize(participantName, maxWidth - 20);
  const participantY = courseInfoY + 25;
  doc.text(participantLines, 148.5, participantY, { align: 'center' });

  // Add certificate number
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const certNumberY = participantY + (participantLines.length * 8) + 8;

  // Format certificate number properly - ensure it's displayed correctly
  let formattedCertNumber = 'Certificate #N/A';
  if (data.certificateNumber && data.certificateNumber.trim() !== '') {
    formattedCertNumber = `Certificate #${data.certificateNumber}`;
  }
  doc.text(formattedCertNumber, 148.5, certNumberY, { align: 'center' });

  // Add CE Hours
  doc.setFontSize(16);
  doc.text(`CE Hours: ${data.ceHours}`, 148.5, certNumberY + 12, { align: 'center' });

  // Add issue date
  // Format issue date properly with error handling
  let issuedDate;
  try {
    issuedDate = new Date(data.issuedDate).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    issuedDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
    });
  }
  doc.text(`Issued: ${issuedDate}`, 148.5, certNumberY + 24, { align: 'center' });

  // Add instructor signature
  if (data.instructor) {
    doc.setFont('helvetica', 'bold');
    doc.text(data.instructor, 148.5, certNumberY + 36, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text('Instructor', 148.5, certNumberY + 42, { align: 'center' });
  }

  // Add school name at bottom
  doc.setFontSize(10);
  doc.text(data.schoolName, 148.5, 200, { align: 'center' });

  // Generate data URL
  return doc.output('dataurlstring');
}