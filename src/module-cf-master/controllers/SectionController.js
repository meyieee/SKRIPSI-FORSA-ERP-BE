const Section = require("../models/adm_cf_11_depts_section");

module.exports = {
  getAllSection: async (req, res) => {
    try {
      const sections = await Section.findAll({
        order: [["dept_code", "ASC"], ["section_code", "ASC"]],
      });

      if (!sections || sections.length === 0) {
        return res.status(404).send({
          message: "Data is empty.",
        });
      }

      return res.status(200).send({
        message: "Successfully fetched data.",
        data: sections,
      });
    } catch (error) {
      return res.status(500).send({ message: error.message });
    }
  },
};
