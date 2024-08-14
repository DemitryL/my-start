const config = {
  mode: "production",

  entry: {
    index: "./src/js/index.js",
    //contacts: "./src/js/contacts.js",
  },

  output: {
    filename: "[name].min.js",
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
};

export default config;
