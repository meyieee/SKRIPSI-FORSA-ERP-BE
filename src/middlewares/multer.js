const multer = require("multer");
const path = require("path");

// Multer Handle Image
const storageImage = multer.diskStorage({
  destination: "public/images",
  filename: function (req, file, cb) {
    cb(null, new Date().getDate().toString().padStart(2, '0') + (new Date().getMonth()+1).toString().padStart(2, '0') + new Date().getFullYear() + new Date().getHours().toString().padStart(2, '0') + new Date().getMinutes().toString().padStart(2, '0') + new Date().getSeconds().toString().padStart(2, '0') + '-' + file.originalname );
  }
});

const uploadSingleImage = multer({
  storage: storageImage,
  limits: { fileSize: 10000000 }, // 10mb
  fileFilter: function (req, file, cb) {
    checkFileTypeImage(file, cb);
  }
}).single("image");

const uploadMultipleImage = multer({
  storage: storageImage,
  // limits: { fileSize: 10000000 }, // 10mb
  fileFilter: function (req, file, cb) {
    checkFileTypeImage(file, cb);
  }
}).array("images");

function checkFileTypeImage(file, cb) {
  const fileTypes = /jpeg|jpg|png|/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: Images Only !!!");
  }
}

// Multer handle docx
const storageDocument = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/documents/')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getDate().toString().padStart(2, '0') + (new Date().getMonth()+1).toString().padStart(2, '0') + new Date().getFullYear() + new Date().getHours().toString().padStart(2, '0') + new Date().getMinutes().toString().padStart(2, '0') + new Date().getSeconds().toString().padStart(2, '0') + '-' + file.originalname );
  }
});

const uploadSingleDocument = multer({
  storage: storageDocument,
  limits: { fileSize: 20000000 },
  fileFilter: function (req, file, cb) {
    checkFileTypeDocument(file, cb);
  }
}).single("document");

const uploadMultipleDocuments = multer({
  storage: storageDocument,
  // limits: { fileSize: 20000000 },
  fileFilter: function (req, file, cb) {
    checkFileTypeDocument(file, cb);
  }
}).array("documents");

function checkFileTypeDocument(file, cb) {
  const fileTypes = /|doc|docx|pdf|csv|xlsx|/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: Document Only !!!");
  }
}

// Multer handle all file
const storageFile = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("file di storage file multer:",file);
    if(
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' //docx
      ||file.mimetype ===   'application/msword' //doc
      ||file.mimetype ===  'application/pdf' // pdf
      ||file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' //xlsx
      ||file.mimetype === 'text/csv' // csv
      ){
        cb(null, 'public/documents/')
      }
    if(
       file.mimetype === 'image/jpeg' //jpeg
       ||file.mimetype ==='image/png' //png
       ||file.mimetype ==='image/jpg' //jpg
    ){
      cb(null, 'public/images/')
    }
  },

  filename: function (req, file, cb) {
    cb(null, new Date().getDate().toString().padStart(2, '0') + (new Date().getMonth()+1).toString().padStart(2, '0') + new Date().getFullYear() + new Date().getHours().toString().padStart(2, '0') + new Date().getMinutes().toString().padStart(2, '0') + new Date().getSeconds().toString().padStart(2, '0') + '-' + file.originalname );
  }
});

const uploadSingleFile = multer({
  storage: storageFile,
  // limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    console.log("file di file filter:",file);
    checkFileType(file, cb);
  }
}).single("file");

const uploadMultiplefile = multer({
  storage: storageFile,
  // limits: { fileSize: 1000000 },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).array("files");

function checkFileType(file, cb) {
  const fileTypes = /|doc|docx|pdf|csv|xlsx|jpeg|jpg|png|/;
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: format file is not accepted !!!");
  }
}

module.exports = { uploadSingleImage, uploadMultipleImage, uploadSingleDocument, uploadMultipleDocuments, uploadMultiplefile, uploadSingleFile};