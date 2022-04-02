import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";
import React from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { withSessionSsr } from "../lib/withSession";

function MyApp({ Component, pageProps, router }: AppProps) {
  const [drawer, setDrawer] = React.useState(false);
  const toggleDrawer = () => setDrawer(!drawer);

  const logout = async () => {
    const response = await fetch("/api/logout", {
      method: "POST",
    });
    if (response.ok) {
      router.push("/login");
    }
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Brisk
          </Typography>

          {pageProps.user && (
            <Button color="inherit" onClick={logout}>
              logout
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer anchor={"left"} open={drawer} onClose={toggleDrawer}>
        <Box
          sx={{ width: "auto" }}
          role="presentation"
          onClick={toggleDrawer}
          onKeyDown={toggleDrawer}
        >
          <List>
            {pageProps.user && pageProps.user.admin && (
              <Link href="/admin">
                <ListItem button>
                  <ListItemText primary="Admin" />
                </ListItem>
              </Link>
            )}
            <Link href="/">
              <ListItem button>
                <ListItemText primary="Home" />
              </ListItem>
            </Link>
            <Link href="/tags">
              <ListItem button>
                <ListItemText primary="Tags" />
              </ListItem>
            </Link>
            <Link href="/triggers">
              <ListItem button>
                <ListItemText primary="Triggers" />
              </ListItem>
            </Link>
          </List>
        </Box>
      </Drawer>

      <div className={styles.container}>
        <Head>
          <title>Brisk tag manager</title>
          <meta name="description" content="Brisk tag manager" />
          <link rel="icon" href="/favicon.ico" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
          />
        </Head>

        <div className={styles.main}>
          <Component {...pageProps} />
        </div>

        <footer className={styles.footer}>Powered by grape juice</footer>
      </div>
    </>
  );
}

export default MyApp;
