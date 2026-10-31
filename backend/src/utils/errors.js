class CalculationInputError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CalculationInputError';
  }
}

module.exports = { CalculationInputError };
