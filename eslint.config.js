import jest from "eslint-plugin-jest"
import babelParser from "@babel/eslint-parser";

export default {
  languageOptions: {
    parser: babelParser,
    ecmaVersion: 2021,
    sourceType: "module",
  },
  plugins: {
    jest: jest
  },
};
