const EmployeeType = require('../controllers/EmployeeTypeController')
const EmployeeEmployType = require('../controllers/EmployeeEmployTypeController')
const MaritalBenefit = require('../controllers/MaritalBenefitController')
const LeaveType = require('../controllers/LeaveTypeController')
const WorkDay = require('../controllers/WorkDayController')
const WorkGroup = require('../controllers/WorkGroupController')
const WorkFunction = require('../controllers/WorkFunctionController')
const Level = require('../controllers/LevelController')
const Grade = require('../controllers/GradeController')
const PostTitle = require('../controllers/PostTitleController')
const Education = require('../controllers/EducationController')
const FieldStudy = require('../controllers/FieldStudyController')
const YearExp = require('../controllers/YearExpController')
const Age = require('../controllers/AgeController')
const English = require('../controllers/EnglishController')
const EmployeeClass = require('../controllers/EmployeeClassController')
const EmployeeStatus = require('../controllers/EmployeeStatusController')

const validationAPI = require('../../middlewares/validationAPI')

const EmployeeStatusRouter = (router) =>{
    router.post('/employmentstatus', validationAPI, EmployeeStatus.postEmployeeStatus); // post EmployeeStatus
    router.post('/employmentstatusbatch', validationAPI, EmployeeStatus.postBatchEmploymentStatus); // batch post EmployeeStatus
    router.put('/employmentstatus/:id', validationAPI, EmployeeStatus.updateEmployeeStatus); // edit EmployeeStatus by id
    router.put('/employmentstatus/:id/status', validationAPI, EmployeeStatus.updateStatusEmployeeStatus); // edit EmployeeStatus by id
    router.get('/employmentstatus', validationAPI, EmployeeStatus.getAllEmployeeStatus); // get all EmployeeStatus
    router.get('/employmentstatus/:id', validationAPI, EmployeeStatus.getEmployeeStatus); // get EmployeeStatus by id
}

const EmployeeClassRouter = (router)=>{
    router.post('/employeeclass', validationAPI, EmployeeClass.postEmployeeClass); // post EmployeeClass
    router.post('/employeeclassbatch', validationAPI, EmployeeClass.postBatchEmployeeClass); // batch post EmployeeClass
    router.put('/employeeclass/:id', validationAPI, EmployeeClass.updateEmployeeClass); // edit EmployeeClass by id
    router.put('/employeeclass/:id/status', validationAPI, EmployeeClass.updateStatusEmployeeClass); // edit status EmployeeClass by id
    router.get('/employeeclass', validationAPI, EmployeeClass.getAllEmployeeClass); // get all EmployeeClass
    router.get('/employeeclass/:id', validationAPI, EmployeeClass.getEmployeeClass); // get EmployeeClass by id
}

const EmployeeTypeRouter = (router)=>{
    router.post('/employeetype', validationAPI, EmployeeType.postEmployeeType); // post EmployeeType
    router.post('/employeetypebatch', validationAPI, EmployeeType.postBatchEmployeeType); // batch post EmployeeType
    router.put('/employeetype/:id', validationAPI, EmployeeType.updateEmployeeType); // edit EmployeeType by id
    router.put('/employeetype/:id/status', validationAPI, EmployeeType.updateStatusEmployeeType); // edit status EmployeeType by id
    router.get('/employeetype', validationAPI, EmployeeType.getAllEmployeeType); // get all EmployeeType
    router.get('/employeetype/:id', validationAPI, EmployeeType.getEmployeeType); // get EmployeeType by id
}

const EmployeeEmployTypeRouter = (router) =>{
    router.post('/employmenttype', validationAPI, EmployeeEmployType.postEmployeeEmployType); // post EmployeeEmployType
    router.post('/employmenttypebatch', validationAPI, EmployeeEmployType.postBatchEmploymentType); // batch post EmployeeEmployType
    router.put('/employmenttype/:id', validationAPI, EmployeeEmployType.updateEmployeeEmployType); // edit EmployeeEmployType by id
    router.put('/employmenttype/:id/status', validationAPI, EmployeeEmployType.updateStatusEmployeeEmployType); // edit status EmployeeEmployType by id
    router.get('/employmenttype', validationAPI, EmployeeEmployType.getAllEmployeeEmployType); // get all EmployeeEmployType
    router.get('/employmenttype/:id', validationAPI, EmployeeEmployType.getEmployeeEmployType); // get EmployeeEmployType by id
}

const MaritalBenefitRouter = (router) =>{
    router.post('/maritalbenefit', validationAPI, MaritalBenefit.postMaritalBenefit); // post MaritalBenefit
    router.post('/maritalbenefitbatch', validationAPI, MaritalBenefit.postBatchMaritalBenefit); // batch post MaritalBenefit
    router.put('/maritalbenefit/:id', validationAPI, MaritalBenefit.updateMaritalBenefit); // edit MaritalBenefit by id
    router.put('/maritalbenefit/:id/status', validationAPI, MaritalBenefit.updateStatusMaritalBenefit); // edit status MaritalBenefit by id
    router.get('/maritalbenefit', validationAPI, MaritalBenefit.getAllMaritalBenefit); // get all MaritalBenefit
    router.get('/maritalbenefit/:id', validationAPI, MaritalBenefit.getMaritalBenefit); // get MaritalBenefit by id
}

const LeaveTypeRouter = (router)=>{
    router.post('/leavetype', validationAPI, LeaveType.postLeaveType); // post LeaveType
    router.post('/leavetypebatch', validationAPI, LeaveType.postBatchLeaveType); // batch post LeaveType
    router.put('/leavetype/:id', validationAPI, LeaveType.updateLeaveType); // edit LeaveType by id
    router.put('/leavetype/:id/status', validationAPI, LeaveType.updateStatusLeaveType); // edit status LeaveType by id
    router.get('/leavetype', validationAPI, LeaveType.getAllLeaveType); // get all LeaveType
    router.get('/leavetype/:id', validationAPI, LeaveType.getLeaveType); // get LeaveType by id
}

const WorkDayRouter = (router) =>{
    router.post('/workday', validationAPI, WorkDay.postWorkDay); // post WorkDay
    router.post('/workdaybatch', validationAPI, WorkDay.postBatchWorkDay); // batch post WorkDay
    router.put('/workday/:id', validationAPI, WorkDay.updateWorkDay); // edit WorkDay by id
    router.put('/workday/:id/status', validationAPI, WorkDay.updateStatusWorkDay); // edit status WorkDay by id
    router.get('/workday', validationAPI, WorkDay.getAllWorkDay); // get all WorkDay
    router.get('/workday/:id', validationAPI, WorkDay.getWorkDay); // get WorkDay by id
}

const WorkGroupRouter = (router)=>{
    router.post('/workgroup', validationAPI, WorkGroup.postWorkGroup); // post WorkGroup
    router.post('/workgroupbatch', validationAPI, WorkGroup.postBatchWorkGroup); // batch post WorkGroup
    router.put('/workgroup/:id', validationAPI, WorkGroup.updateWorkGroup); // edit WorkGroup by id
    router.put('/workgroup/:id/status', validationAPI, WorkGroup.updateStatusWorkGroup); // edit status WorkGroup by id
    router.get('/workgroup', validationAPI, WorkGroup.getAllWorkGroup); // get all WorkGroup
    router.get('/workgroup/:id', validationAPI, WorkGroup.getWorkGroup); // get WorkGroup by id
}

const WorkFunctionRouter = (router)=>{
    router.post('/workfunction', validationAPI, WorkFunction.postWorkFunction); // post WorkFunction
    router.post('/workfunctionbatch', validationAPI, WorkFunction.postBatchWorkFunction); // batch post WorkFunction
    router.put('/workfunction/:id', validationAPI, WorkFunction.updateWorkFunction); // edit WorkFunction by id
    router.put('/workfunction/:id/status', validationAPI, WorkFunction.updateStatusWorkFunction); // edit status WorkFunction by id
    router.get('/workfunction', validationAPI, WorkFunction.getAllWorkFunction); // get all WorkFunction
    router.get('/workfunction/:id', validationAPI, WorkFunction.getWorkFunction); // get WorkFunction by id
}

const LevelRouter = (router) =>{    
    router.post('/level', validationAPI, Level.postLevel); // post Level
    router.post('/levelbatch', validationAPI, Level.postBatchLevel); // batch post Level
    router.put('/level/:id', validationAPI, Level.updateLevel); // edit Level by id
    router.put('/level/:id/status', validationAPI, Level.updateStatusLevel); // edit status Level by id
    router.get('/level', validationAPI, Level.getAllLevel); // get all Level
    router.get('/level/:id', validationAPI, Level.getLevel); // get Level by id
}

const GradeRouter = (router) =>{
    router.post('/grade', validationAPI, Grade.postGrade); // post Grade
    router.post('/gradebatch', validationAPI, Grade.postBatchGrade); // batch post Grade
    router.put('/grade/:id', validationAPI, Grade.updateGrade); // edit Grade by id
    router.put('/grade/:id/status', validationAPI, Grade.updateStatusGrade); // edit status Grade by id
    router.get('/grade', validationAPI, Grade.getAllGrade); // get all Grade
    router.get('/grade/:id', validationAPI, Grade.getGrade); // get Grade by id
}

const PostTitleRouter = (router)=>{
    router.post('/posttitle', validationAPI, PostTitle.postPostTitle); // post PostTitle
    router.post('/posttitlebatch', validationAPI, PostTitle.postBatchPostTitle); // batch post PostTitle
    router.put('/posttitle/:id', validationAPI, PostTitle.updatePostTitle); // edit PostTitle by id
    router.put('/posttitle/:id/status', validationAPI, PostTitle.updateStatusPostTitle); // edit status PostTitle by id
    router.get('/posttitle', validationAPI, PostTitle.getAllPostTitle); // get all PostTitle
    router.get('/posttitle/:id', validationAPI, PostTitle.getPostTitle); // get PostTitle by id
}

const EducationRouter = (router)=>{
    router.post('/education', validationAPI, Education.postEducation); // post Education
    router.post('/educationbatch', validationAPI, Education.postBatchEducation); // batch post Education
    router.put('/education/:id', validationAPI, Education.updateEducation); // edit Education by id
    router.put('/education/:id/status', validationAPI, Education.updateStatusEducation); // edit status Education by id
    router.get('/education', validationAPI, Education.getAllEducation); // get all Education
    router.get('/education/:id', validationAPI, Education.getEducation); // get Education by id
}

const FieldStudyRouter = (router) =>{
    router.post('/fieldstudy', validationAPI, FieldStudy.postFieldStudy); // post FieldStudy
    router.post('/fieldstudybatch', validationAPI, FieldStudy.postBatchFieldStudy); // batch post FieldStudy
    router.put('/fieldstudy/:id', validationAPI, FieldStudy.updateFieldStudy); // edit FieldStudy by id
    router.put('/fieldstudy/:id/status', validationAPI, FieldStudy.updateStatusFieldStudy); // edit status FieldStudy by id
    router.get('/fieldstudy', validationAPI, FieldStudy.getAllFieldStudy); // get all FieldStudy
    router.get('/fieldstudy/:id', validationAPI, FieldStudy.getFieldStudy); // get FieldStudy by id
}

const YearExperienceRouter = (router)=>{
    router.post('/yearexp', validationAPI, YearExp.postYearExp); // post YearExp
    router.post('/yearexpbatch', validationAPI, YearExp.postBatchYearExp); // batch post YearExp
    router.put('/yearexp/:id', validationAPI, YearExp.updateYearExp); // edit YearExp by id
    router.put('/yearexp/:id/status', validationAPI, YearExp.updateStatusYearExp); // edit status YearExp by id
    router.get('/yearexp', validationAPI, YearExp.getAllYearExp); // get all YearExp
    router.get('/yearexp/:id', validationAPI, YearExp.getYearExp); // get YearExp by id
}

const AgeRouter = (router)=>{
    router.post('/age', validationAPI, Age.postAge); // post Age
    router.post('/agebatch', validationAPI, Age.postBatchAge); // batch post Age
    router.put('/age/:id', validationAPI, Age.updateAge); // edit Age by id
    router.put('/age/:id/status', validationAPI, Age.updateStatusAge); // edit status Age by id
    router.get('/age', validationAPI, Age.getAllAge); // get all Age
    router.get('/age/:id', validationAPI, Age.getAge); // get Age by id
}

const EnglishRouter = (router)=>{
    router.post('/english', validationAPI, English.postEnglish); // post English
    router.post('/englishbatch', validationAPI, English.postBatchEnglish); // batch post English
    router.put('/english/:id', validationAPI, English.updateEnglish); // edit English by id
    router.put('/english/:id/status', validationAPI, English.updateStatusEnglish); // edit status English by id
    router.get('/english', validationAPI, English.getAllEnglish); // get all English
    router.get('/english/:id', validationAPI, English.getEnglish); // get English by id
}

const index = (router) =>{
    EmployeeStatusRouter(router)
    EmployeeClassRouter(router)
    EmployeeTypeRouter(router)
    EmployeeEmployTypeRouter(router)
    MaritalBenefitRouter(router)
    LeaveTypeRouter(router)
    WorkDayRouter(router)
    WorkGroupRouter(router)
    WorkFunctionRouter(router)
    LevelRouter(router)
    GradeRouter(router)
    PostTitleRouter(router)
    EducationRouter(router)
    FieldStudyRouter(router)
    YearExperienceRouter(router)
    AgeRouter(router)
    EnglishRouter(router)
}

module.exports = index