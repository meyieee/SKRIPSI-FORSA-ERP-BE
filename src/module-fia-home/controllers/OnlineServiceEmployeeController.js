const { Op } = require("sequelize");
const EmpReg = require("../../module-hr/models/tbl_emp_regs");

const toStr = (v) => (v === null || v === undefined ? "" : String(v));

const normalizeSpaces = (s) => toStr(s).replace(/\s+/g, " ").trim();

const buildFullName = (row) =>
  normalizeSpaces(
    [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ")
  ) ||
  normalizeSpaces(row.nick_name) ||
  toStr(row.id_number);

/**
 * GET /online-service/employees/search?q=
 * All Active employees from tbl_emp_regs (no hierarchy filter); for online-service Request For typeahead.
 * Empty q: up to 50 Active rows; session user (req.user.id_number) ordered first, then id_number ASC.
 * Non-empty q: LIKE filter on id/name/emails; same ordering (matched user first among results).
 */
const searchActiveEmployees = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const q = normalizeSpaces(req.query.q);
    const myId = normalizeSpaces(req.user.id_number || "");

    const sequelize = EmpReg.sequelize;
    const baseWhere = { status: "Active" };
    const where = q
      ? {
          ...baseWhere,
          [Op.or]: [
            { id_number: { [Op.like]: `%${q}%` } },
            { first_name: { [Op.like]: `%${q}%` } },
            { middle_name: { [Op.like]: `%${q}%` } },
            { last_name: { [Op.like]: `%${q}%` } },
            { nick_name: { [Op.like]: `%${q}%` } },
            { email_company: { [Op.like]: `%${q}%` } },
            { personal_email: { [Op.like]: `%${q}%` } },
          ],
        }
      : baseWhere;

    const order =
      myId && sequelize
        ? [
            [
              sequelize.literal(
                `(CASE WHEN id_number = ${sequelize.escape(
                  myId
                )} THEN 0 ELSE 1 END)`
              ),
              "ASC",
            ],
            ["id_number", "ASC"],
          ]
        : [["id_number", "ASC"]];

    const rows = await EmpReg.findAll({
      where,
      attributes: [
        "id_number",
        "first_name",
        "middle_name",
        "last_name",
        "nick_name",
        "email_company",
        "personal_email",
        "photo",
      ],
      limit: 50,
      order,
    });

    const data = rows.map((r) => {
      const row = r.get ? r.get({ plain: true }) : r;
      return {
        id_number: toStr(row.id_number),
        full_name: buildFullName(row),
        email:
          toStr(row.email_company) || toStr(row.personal_email) || "",
        photo: toStr(row.photo) || "",
      };
    });

    return res.status(200).json({ message: "OK", data });
  } catch (err) {
    console.error("searchActiveEmployees error:", err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  searchActiveEmployees,
};
