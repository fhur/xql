import { JSONSchemaType } from 'ajv';
import { CliConfig } from '../types/CliConfig';

export const schemaDefOverridesSchema: JSONSchemaType<
    CliConfig['schemaDefOverrides']
> = {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    patternProperties: {
        '^[^.]+.[^.]+$': {
            type: 'object',
            patternProperties: {
                '^[^.]+$': {
                    type: 'object',
                    properties: {
                        type: {
                            type: 'object',
                            properties: {
                                id: {
                                    type: 'string',
                                },
                                description: {
                                    type: 'string',
                                },
                                type: {
                                    type: 'string',
                                },
                                title: {
                                    type: 'string',
                                    nullable: true,
                                },
                                tsType: {
                                    type: 'string',
                                    nullable: true,
                                },
                                minimum: {
                                    type: 'number',
                                    nullable: true,
                                },
                                maximum: {
                                    type: 'number',
                                    nullable: true,
                                },
                                format: {
                                    type: 'string',
                                    nullable: true,
                                },
                                enum: {
                                    type: 'array',
                                    items: {
                                        type: 'string',
                                    },
                                    nullable: true,
                                },
                            },
                            nullable: true,
                            required: ['id', 'type', 'description'],
                            additionalProperties: false,
                        },
                        selectable: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                },
                                const: {
                                    type: 'boolean',
                                },
                            },
                            nullable: true,
                            required: ['type', 'const'],
                            additionalProperties: false,
                        },
                        includable: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                },
                                const: {
                                    type: 'boolean',
                                },
                            },
                            nullable: true,
                            required: ['type', 'const'],
                            additionalProperties: false,
                        },
                        whereable: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                },
                                const: {
                                    type: 'boolean',
                                },
                            },
                            nullable: true,
                            required: ['type', 'const'],
                            additionalProperties: false,
                        },
                        nullable: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                },
                                const: {
                                    type: 'boolean',
                                },
                            },
                            nullable: true,
                            required: ['type', 'const'],
                            additionalProperties: false,
                        },
                        isPrimaryKey: {
                            type: 'object',
                            properties: {
                                type: {
                                    type: 'string',
                                },
                                const: {
                                    type: 'boolean',
                                },
                            },
                            nullable: true,
                            required: ['type', 'const'],
                            additionalProperties: false,
                        },
                    },
                    required: [],
                    additionalProperties: false,
                },
            },
            required: [],
            additionalProperties: false,
        },
    },
    required: [],
    additionalProperties: false,
};

export const configFileSchema: JSONSchemaType<Partial<CliConfig>> = {
    $schema: 'http://json-schema.org/draft-07/schema',
    type: 'object',
    properties: {
        $schema: {
            type: 'string',
            nullable: true,
        },
        out: {
            type: 'string',
            nullable: true,
        },
        defaultSchema: {
            type: 'string',
            nullable: true,
        },
        schemas: {
            type: 'array',
            items: {
                type: 'string',
            },
            nullable: true,
        },
        tables: {
            type: 'array',
            items: {
                type: 'string',
            },
            nullable: true,
        },
        schemaDefOverrides: {
            ...schemaDefOverridesSchema,
            nullable: true,
        },
    },
    required: [],
    additionalProperties: false,
};