import { body, param } from "express-validator";

const nameValidationRules = (() => {
  return [
    body("name")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Name Can not be empty"),
  ];
})();

const idValidationRules = (() => {
  return [param("id").isInt().withMessage("ID must be an integer").toInt()];
})();

export { nameValidationRules, idValidationRules };
