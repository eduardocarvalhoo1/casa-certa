function success(res, status, data) {
  return res.status(status).json(data);
}

function error(res, status, message, details) {
  const body = { error: message };
  if (Array.isArray(details) && details.length > 0) {
    body.details = details;
  }
  return res.status(status).json(body);
}

const badRequest = (res, message, details) =>
  error(res, 400, message || 'Requisição inválida.', details);

const notFound = (res, message) =>
  error(res, 404, message || 'Recurso não encontrado.');

const serverError = (res, message) =>
  error(res, 500, message || 'Erro interno do servidor.');

module.exports = {
  success,
  error,
  badRequest,
  notFound,
  serverError,
};
