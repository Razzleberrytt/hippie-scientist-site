import Ajv from 'ajv'

const ajv = new Ajv({ allErrors: true })

export function createSchemaValidator(schema) {
  return ajv.compile(schema)
}
