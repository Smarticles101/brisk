import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { withSessionSsr } from "../lib/withSession";
import styles from "../styles/Home.module.css";

const Home: NextPage = (props) => {
  return (
    <>
      <p>
        Welcome, {props.user.username}!
      </p>
    </>
  );
};

export const getServerSideProps = withSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;

    if (!user) {
      return {
        redirect: {
          permanent: false,
          destination: "/login"
        }
      }
    }

    return {
      props: {
        user: req.session.user,
      },
    };
  }
)

export default Home;
