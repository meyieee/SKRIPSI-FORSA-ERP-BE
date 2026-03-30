const fs = require("fs-extra");
const path = require("path");

//menghapus files ketika gagal post atau update item
const deleteFilesWhenFailedPostOrUpdate = (reqFiles, type) => {
  if(reqFiles.length > 0 && type){
    for(let i = 0; i < reqFiles.length; i ++){
      const filePath = path.join(`public/${type}/${reqFiles[i].filename}`)
      // Periksa apakah file ada
      if (fs.existsSync(filePath)) {
        // Jika file ada, hapus
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Gagal menghapus file ${filePath}: ${err}`);
          } else {
            console.log(`Berhasil menghapus file ${filePath}`);
          }
        });
      } else {
        // Jika file tidak ada, beri pesan peringatan
        console.warn(`File tidak ditemukan: ${filePath}`);
      }
    }
  }
  return null;
}

//menghapus files ketika gagal post atau update item, tapi filesnya punya type file lebih dari 1
const deleteMultipleTypeFilesWhenFailedPostOrUpdate = (reqFiles)=>{
  if(reqFiles.length > 0){
    for(let i = 0; i < reqFiles.length; i++){
    if(
      //jika tipe filenya itu document dan kawan kawan
        reqFiles[i].mimetype == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ||reqFiles[i].mimetype == 'application/msword'
        ||reqFiles[i].mimetype == 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ||reqFiles[i].mimetype == 'application/pdf'
        ||reqFiles[i].mimetype == 'text/csv'
        ){
          const filePath = path.join(`public/documents/${reqFiles[i].filename}`)
          if (fs.existsSync(filePath)) {
            // Jika file ada, hapus
            fs.unlink(filePath, (err) => {
              if (err) {
                console.error(`Gagal menghapus file ${filePath}: ${err}`);
              } else {
                console.log(`Berhasil menghapus file ${filePath}`);
              }
            });
          } else {
            // Jika file tidak ada, beri pesan peringatan
            console.warn(`File tidak ditemukan: ${filePath}`);
          }
    }
    else if(reqFiles[i].mimetype == 'image/jpeg' || reqFiles[i].mimetype == 'image/png' ||reqFiles[i].mimetype == 'image/jpg'){
      //jika tipe filenya itu image
        const filePath = path.join(`public/images/${reqFiles[i].filename}`)
        if (fs.existsSync(filePath)) {
          // Jika file ada, hapus
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Gagal menghapus file ${filePath}: ${err}`);
            } else {
              console.log(`Berhasil menghapus file ${filePath}`);
            }
          });
        } else {
          // Jika file tidak ada, beri pesan peringatan
          console.warn(`File tidak ditemukan: ${filePath}`);
        }
    }
    else{console.log("Tipe file tidak tersedia")}
    }
  }
  return null;
}

//menghapus files. sepertinya hanya khusus untuk PM (tbl_ops_pm_docs) form dan WO (tbl_ops_wo_docs) form
const deleteFiles = (datas) =>{
  if(datas.length > 0){
    for (let i = 0; i < datas.length; i++) {
      const filePath = path.join(`public/${datas[i].file_attached}`);
      // Periksa apakah file ada
      if (fs.existsSync(filePath)) {
        // Jika file ada, hapus
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Gagal menghapus file ${filePath}: ${err}`);
          } else {
            console.log(`Berhasil menghapus file ${filePath}`);
          }
        });
      } else {
        // Jika file tidak ada, beri pesan peringatan
        console.warn(`File tidak ditemukan: ${filePath}`);
      }
    }
  }
  return null;
}
 


//menghapus files. sepertinya hanya khusus untuk PM (tbl_ops_pm_docs) form dan WO (tbl_ops_wo_docs) form
const deleteFilesPOMaster = (datas) =>{
  if(datas.length > 0){
    for (let i = 0; i < datas.length; i++) {
      const filePath = path.join(`public/${datas[i].dataValues.document}`);
      // Periksa apakah file ada
      if (fs.existsSync(filePath)) {
        // Jika file ada, hapus
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Gagal menghapus file ${filePath}: ${err}`);
          } else {
            console.log(`Berhasil menghapus file ${filePath}`);
          }
        });
      } else {
        // Jika file tidak ada, beri pesan peringatan
        console.warn(`File tidak ditemukan: ${filePath}`);
      }
    }
  }
  return null;
}
 

//menghapus contract files (com table -> com contract -> com contract files)
const deleteContractFiles = (datas) =>{
  if(datas.length > 0){
    for (let i = 0; i < datas.length; i++) {
      const filePath = path.join(`public/${datas[i].file_url}`);
      // Periksa apakah file ada
      if (fs.existsSync(filePath)) {
        // Jika file ada, hapus
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Gagal menghapus file ${filePath}: ${err}`);
          } else {
            console.log(`Berhasil menghapus file ${filePath}`);
          }
        });
      } else {
        // Jika file tidak ada, beri pesan peringatan
        console.warn(`File tidak ditemukan: ${filePath}`);
      }
    }
  }
  return null;
}


//menghapus file ketika gagal post atau update item
const deleteFileWhenFailedPostOrUpdate = (reqFile, type) => {
  if(reqFile && type){
    const filePath = path.join(`public/${type}/${reqFile.filename}`)
    // Periksa apakah file ada
    if (fs.existsSync(filePath)) {
      // Jika file ada, hapus
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Gagal menghapus file ${filePath}: ${err}`);
        } else {
          console.log(`Berhasil menghapus file ${filePath}`);
        }
      });
    } else {
      // Jika file tidak ada, beri pesan peringatan
      console.warn(`File tidak ditemukan: ${filePath}`);
    }
  }
  return null;
}

//menghapus file yang ingin dihapus atau yang ingin ditimpa dari form
const deleteFile = (file) =>{
  // console.log("file:",file)
    if(file){
      const filePath = path.join(`public/${file}`);
      // Periksa apakah file ada
      if (fs.existsSync(filePath)) {
        // Jika file ada, hapus
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Gagal menghapus file ${filePath}: ${err}`);
          } else {
            console.log(`Berhasil menghapus file ${filePath}`);
          }
        });
      } else {
        // Jika file tidak ada, beri pesan peringatan
        console.warn(`File tidak ditemukan: ${filePath}`);
      }
    }
  return null;
}
  
module.exports = { deleteFilesWhenFailedPostOrUpdate, deleteFileWhenFailedPostOrUpdate, deleteFiles, deleteFile, deleteMultipleTypeFilesWhenFailedPostOrUpdate, deleteContractFiles, deleteFilesPOMaster};