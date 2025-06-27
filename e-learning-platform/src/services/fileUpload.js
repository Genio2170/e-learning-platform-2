const generateCertificate = async (student, course) => {
  const certId = new mongoose.Types.ObjectId();
  const verificationCode = `CERT-${certId.toString().substring(0, 8).toUpperCase()}`;
  
  // Gerar PDF usando pdfkit ou similar
  const certUrl = await generatePDF(student, course, verificationCode);
  
  const certificate = new Certificate({
    student: student._id,
    course: course._id,
    certificateUrl: certUrl,
    verificationCode
  });
  
  await certificate.save();
  return certificate;
};
