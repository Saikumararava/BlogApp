import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#009688' },   // teal
    secondary: { main: '#ff5722' }  // deep orange
  },
  typography: {
    h6: { fontWeight: 600 }
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true }
    },
    MuiAppBar: {
      defaultProps: { elevation: 3 }
    }
  }
});

export default theme;
