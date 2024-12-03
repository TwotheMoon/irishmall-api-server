
// 루트 컨트롤러
export const rootController = (req, res) => {
  res.redirect(301, "https://moondashboard.netlify.app/");
};

// 헬스체크 컨트롤러
export const healthCkController = async (req, res) => {
  const date = new Date();
  const status = true;
  const data = {
    date,
    status
  }
  res.json(data);
};
