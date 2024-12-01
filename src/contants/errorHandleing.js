export const handleSuccess = (res, data, message = "요청이 성공적으로 처리되었습니다.") => {
  res.status(200).json({
    status: 200,
    message,
    data,
  });
};

export const handleError = (res, error, customMessage = "서버 에러") => {
  console.error(customMessage, error.message || error);
  res.status(500).json({
    status: 500,
    error: customMessage,
    details: error.message || "알 수 없는 에러",
  });
};
