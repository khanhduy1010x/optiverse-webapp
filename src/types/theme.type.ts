export interface AppTheme {
  colors: {
    primary: string;
    onPrimary: string;
    background: string;
    surface: string;
    border: string;
    text: string;
  };
  components: {
    button: {
      default: {
        background: string;
        text: string;
      };
      inverted: {
        background: string;
        text: string;
      };
    };
    input: {
      default: {
        background: string;
        text: string;
      };
      inverted: {
        background: string;
        text: string;
      };
    };
  };
  fonts: {
    regular: string;
    bold: string;
  };
}
