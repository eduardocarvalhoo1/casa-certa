const OBJECTIVES = require('../config/objectives');

const VALID_SYSTEMS = ['SAC', 'PRICE'];
const VALID_OBJECTIVES = Object.keys(OBJECTIVES);

function isNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositiveNumber(value) {
  return isNumber(value) && value > 0;
}

function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateSimulationInput(body) {
  const errors = [];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: ['O corpo da requisição é obrigatório.'] };
  }

  const { name, objective, system, propertyValue, financing, consortium } = body;

  if (!isNonEmptyString(name)) {
    errors.push('O campo "name" é obrigatório.');
  }

  if (!VALID_OBJECTIVES.includes(objective)) {
    errors.push(
      `O campo "objective" deve ser um dos valores: ${VALID_OBJECTIVES.join(', ')}.`
    );
  }

  if (!VALID_SYSTEMS.includes(system)) {
    errors.push(`O campo "system" deve ser "SAC" ou "PRICE".`);
  }

  if (!isPositiveNumber(propertyValue)) {
    errors.push('O campo "propertyValue" deve ser um número positivo.');
  }

  if (!financing || typeof financing !== 'object') {
    errors.push('O bloco "financing" é obrigatório.');
  } else {
    if (!isNumber(financing.downPayment) || financing.downPayment < 0) {
      errors.push('O campo "financing.downPayment" deve ser um número >= 0.');
    }
    if (isPositiveNumber(propertyValue) && isNumber(financing.downPayment) &&
        financing.downPayment >= propertyValue) {
      errors.push('A entrada ("financing.downPayment") deve ser menor que o valor do imóvel.');
    }
    if (!isPositiveInteger(financing.termYears)) {
      errors.push('O campo "financing.termYears" deve ser um inteiro positivo (anos).');
    }
    if (!isPositiveNumber(financing.interestRateAnnual)) {
      errors.push('O campo "financing.interestRateAnnual" deve ser um número positivo.');
    }
  }

  if (!consortium || typeof consortium !== 'object') {
    errors.push('O bloco "consortium" é obrigatório.');
  } else {
    if (!isPositiveNumber(consortium.creditValue)) {
      errors.push('O campo "consortium.creditValue" deve ser um número positivo.');
    } else if (isPositiveNumber(propertyValue) && consortium.creditValue > propertyValue) {
      errors.push(
        'O crédito do consórcio ("consortium.creditValue") não pode ser maior que o valor do imóvel.'
      );
    }
    if (!isPositiveInteger(consortium.termMonths)) {
      errors.push('O campo "consortium.termMonths" deve ser um inteiro positivo (meses).');
    }
    if (!isNumber(consortium.adminRateTotal) ||
        consortium.adminRateTotal < 0 || consortium.adminRateTotal > 1) {
      errors.push(
        'O campo "consortium.adminRateTotal" deve ser um número entre 0 e 1 (taxa total do plano, ex.: 0.16 = 16%).'
      );
    }
    if (!isNumber(consortium.reserveFund) || consortium.reserveFund < 0) {
      errors.push('O campo "consortium.reserveFund" deve ser um número >= 0.');
    }
    if (consortium.initialBid !== undefined &&
        (!isNumber(consortium.initialBid) || consortium.initialBid < 0)) {
      errors.push('O campo "consortium.initialBid" deve ser um número >= 0 quando informado.');
    }
    if (consortium.contemplationMonth !== undefined && consortium.contemplationMonth !== null) {
      const month = consortium.contemplationMonth;
      if (!isPositiveInteger(month)) {
        errors.push(
          'O campo "consortium.contemplationMonth" deve ser um inteiro positivo (mês) quando informado.'
        );
      } else if (isPositiveInteger(consortium.termMonths) && month > consortium.termMonths) {
        errors.push(
          'O mês de contemplação ("consortium.contemplationMonth") não pode ser maior que o prazo do consórcio.'
        );
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  isNumber,
  isPositiveNumber,
  isPositiveInteger,
  isNonEmptyString,
  validateSimulationInput,
  VALID_SYSTEMS,
  VALID_OBJECTIVES,
};
