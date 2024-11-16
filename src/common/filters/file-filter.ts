export const fileFilter = (req, file, callback) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(
      new Error(
        `Unsupported file type ${file.originalname}. Allowed types are: PDF, DOC, DOCX, XLS, XLSX.`,
      ),
      false,
    );
  }
};
