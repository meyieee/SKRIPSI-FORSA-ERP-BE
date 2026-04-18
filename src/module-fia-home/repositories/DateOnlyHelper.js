function formatLocalDate(date = new Date()) {
  const dt = date instanceof Date ? date : new Date(date);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

module.exports = {
  formatLocalDate,
};
