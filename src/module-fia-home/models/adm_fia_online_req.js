const { Model, DataTypes } = require("sequelize");

class adm_fia_online_req extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        request_type: DataTypes.STRING,
        ref_request_no: DataTypes.STRING,
        request_date: DataTypes.DATE,
        request_by: DataTypes.STRING,
        request_for: DataTypes.STRING,
        request_purpose: DataTypes.STRING,
        priority: {
          type: DataTypes.STRING,
          defaultValue: "3",
        },
        approval_status: {
          type: DataTypes.STRING(150),
          allowNull: false,
          defaultValue: "",
        },
        branch_site: DataTypes.STRING,
        department: DataTypes.STRING,
        cost_center: DataTypes.STRING,
        request_description: DataTypes.STRING,
        justification: DataTypes.STRING,
        comments: DataTypes.STRING,
        add_comments: DataTypes.STRING,
        relevant_docs: DataTypes.STRING,
        relevant_docs_second: DataTypes.STRING,
        location: DataTypes.STRING,
        work_location: DataTypes.STRING,
        job_type: DataTypes.STRING,
        asset_no: DataTypes.STRING,
        special_instructions: DataTypes.STRING,
        safety_precautions: DataTypes.STRING,
        material_required: DataTypes.STRING,
        tool_required: DataTypes.STRING,
        assigned_to: DataTypes.STRING,
        schedule_start_date: DataTypes.DATE,
        completion_date: DataTypes.DATE,
        workorder_status: DataTypes.STRING,
        is_draft: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          allowNull: false,
        },
        actual_start_date: DataTypes.DATE,
        actual_completion_date: DataTypes.DATE,
        workorder_closure_date: DataTypes.DATE,
        fleet_type: DataTypes.STRING,
        number_of_units: DataTypes.INTEGER,
        specifications: DataTypes.STRING,
        current_owner: DataTypes.STRING,
        reason_for_transfer: DataTypes.STRING,
        inspection_summary: DataTypes.STRING,
        departure: DataTypes.DATE,
        return_date: DataTypes.DATE,
        no_days_absent: DataTypes.INTEGER,
        number_of_person: DataTypes.INTEGER,
        date_return_to_work: DataTypes.DATE,
        point_of_leave: DataTypes.STRING,
        total_leave_days_remaining: DataTypes.INTEGER,
        total_day_taken_on_this_holiday: DataTypes.INTEGER,
        day_off_holiday: DataTypes.INTEGER,
        total_days_taken_on_this_vacation: DataTypes.INTEGER,
        last_balance_entitlement: DataTypes.INTEGER,
        first_workday_absentfrom_work: DataTypes.DATE,
        last_workday_absent_from_work: DataTypes.DATE,
        total_number_of_days_absent: DataTypes.INTEGER,
        less_statutory: DataTypes.INTEGER,
        net_working_days_leave_requested: DataTypes.INTEGER,
        training_title: DataTypes.STRING,
        training_duration: DataTypes.INTEGER,
        training_method: DataTypes.STRING,
        last_attended: DataTypes.DATE,
        training_provider: DataTypes.STRING,
        date_of_training: DataTypes.DATE,
        venue: DataTypes.STRING,
        fees: DataTypes.DECIMAL(24, 9),
        employee_request: DataTypes.STRING,
        supervisor_request: DataTypes.STRING,
        job_title: DataTypes.STRING,
        number_of_position: DataTypes.INTEGER,
        employment_type: DataTypes.STRING,
        overtime_require: DataTypes.STRING,
        work_schedule: DataTypes.STRING,
        shift: DataTypes.STRING,
        job_description: DataTypes.STRING,
        key_responsibilities: DataTypes.STRING,
        required_skills: DataTypes.STRING,
        experience: DataTypes.STRING,
        education: DataTypes.STRING,
        asset_type: DataTypes.STRING,
        asset_model: DataTypes.STRING,
        asset_specification: DataTypes.STRING,
        quantity: DataTypes.INTEGER,
        expense_type: DataTypes.STRING,
        amount_request: DataTypes.DECIMAL(24, 9),
        payment_method: DataTypes.STRING,
        bank_account: DataTypes.STRING,
        supplier: DataTypes.STRING,
        visitor_name: DataTypes.STRING,
        duration_of_stay: DataTypes.INTEGER,
        accomodation_type: DataTypes.STRING,
        number_of_nights: DataTypes.INTEGER,
        extra_bed: DataTypes.STRING,
        meal_provided: DataTypes.STRING,
        accomodation_location: DataTypes.STRING,
        room_number: DataTypes.STRING,
        checkin_time: DataTypes.DATE,
        checkout_time: DataTypes.DATE,
        destination: DataTypes.STRING,
        no_of_passengers: DataTypes.INTEGER,
        special_requirement: DataTypes.STRING,
        mode_of_transport: DataTypes.STRING,
        pickup_time: DataTypes.DATE,
        drop_off_time: DataTypes.DATE,
        vehicle_no: DataTypes.STRING,
        driver_name: DataTypes.STRING,
        contact_no: DataTypes.STRING,
        company_organizer: DataTypes.STRING,
        contact: DataTypes.STRING,
        date_visit: DataTypes.DATE,
        time_visit: DataTypes.DATE,
        expected_duration: DataTypes.STRING,
        host_name: DataTypes.STRING,
        host_department: DataTypes.STRING,
        host_contact: DataTypes.STRING,
        clearance_required: DataTypes.STRING,
        type_of_clearance: DataTypes.STRING,
        meeting_room: DataTypes.STRING,
        equipment_require: DataTypes.STRING,
        visitor_id: DataTypes.STRING,
        check_by: DataTypes.STRING,
        check_date: DataTypes.DATE,
        check_comments: DataTypes.STRING,
        review_by: DataTypes.STRING,
        review_date: DataTypes.DATE,
        review_comments: DataTypes.STRING,
        approve_one: DataTypes.STRING,
        approve_one_date: DataTypes.DATE,
        approve_one_comments: DataTypes.STRING,
        approve_second_by: DataTypes.STRING,
        approve_second_date: DataTypes.DATE,
        approve_second_comments: DataTypes.STRING,
        approve_third_by: DataTypes.STRING,
        approve_third_date: DataTypes.DATE,
        approve_third_comments: DataTypes.STRING,
        created_at: DataTypes.DATE,
        updated_at: DataTypes.DATE,
      },
      {
        sequelize,
        tableName: "adm_fia_online_req",
        timestamps: true,
        underscored: true,
        indexes: [
          // UNIQUE INDEX - ref_request_no
          {
            name: "uq_ref_request_no",
            unique: true,
            fields: ["ref_request_no"],
          },
          // Composite INDEX - Approval 1 Pending
          {
            name: "idx_appr_1_pending",
            fields: ["approve_one", "approve_one_date"],
          },
          // INDEX - Search Reference
          {
            name: "idx_search_ref",
            fields: ["ref_request_no"],
          },
          // Composite INDEX - Search User
          {
            name: "idx_search_user",
            fields: ["request_by", "request_type"],
          },
          // INDEX - Type Date
          {
            name: "idx_type_date",
            fields: ["request_date"],
          },
          // Composite INDEX - Status
          {
            name: "idx_status",
            fields: ["workorder_status", "assigned_to"],
          },
          // INDEX - My Task
          {
            name: "idx_my_task",
            fields: ["workorder_status"],
          },
          // Composite INDEX - Approval 2 Pending
          {
            name: "idx_appr_2_pending",
            fields: ["approve_second_by", "approve_second_date"],
          },
          // Composite INDEX - Approval 3 Pending
          {
            name: "idx_appr_3_pending",
            fields: ["approve_third_by", "approve_third_date"],
          },
          // INDEX - Approval Status
          {
            name: "idx_approval_status",
            fields: ["approval_status"],
          },
          // Composite INDEX - Approval Status with Request Type
          {
            name: "idx_approval_status_type",
            fields: ["approval_status", "request_type"],
          },
          // Composite INDEX - Approval Status with Workorder Status
          {
            name: "idx_approval_workorder_status",
            fields: ["approval_status", "workorder_status"],
          },
        ],
      }
    );
  }

  static associate(models) {
    // Associations can be added here if needed
    // Example:
    // this.belongsTo(models.tbl_emp_regs, {
    //   foreignKey: 'request_by',
    //   targetKey: 'id_number',
    //   as: 'request_by_detail'
    // });

    // request_for -> employee
    this.belongsTo(models.tbl_emp_regs, {
      foreignKey: "request_for",
      targetKey: "id_number",
      as: "request_for_employee",
    });

    // request_by -> employee
    this.belongsTo(models.tbl_emp_regs, {
      foreignKey: "request_by",
      targetKey: "id_number",
      as: "request_by_employee",
    });
    // Association dengan adm_fia_online_req_inspect (untuk Inspection Defect)
    this.hasMany(models.adm_fia_online_req_inspect, {
      foreignKey: "ref_request_no",
      sourceKey: "ref_request_no",
      as: "defectDetails",
    });

    // Association dengan adm_fia_online_req_traveller (untuk Travel Request)
    this.hasMany(models.adm_fia_online_req_traveller, {
      foreignKey: "ref_request_no",
      sourceKey: "ref_request_no",
      as: "travelers",
    });

    // Association dengan adm_fia_online_req_itempurchasereq (untuk Purchase Requisition)
    this.hasMany(models.adm_fia_online_req_itempurchasereq, {
      foreignKey: "ref_request_no",
      sourceKey: "ref_request_no",
      as: "itemDetails",
    });
  }
}

module.exports = adm_fia_online_req;
