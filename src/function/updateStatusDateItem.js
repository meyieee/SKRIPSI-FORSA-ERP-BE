const functionHandleStatusDate = (status, values)=>{
    if(status !== values._previousDataValues.status){
      return new Date()
    }else{
      return new Date(values._previousDataValues.status_date)
    }
  }

module.exports = { functionHandleStatusDate };