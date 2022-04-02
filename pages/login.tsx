import type { NextPage } from "next";
import React from "react";
import { Button, Stack, TextField } from "@mui/material";
import { withSessionSsr } from "../lib/withSession";
import { useRouter } from "next/router";

const defaultValues = {
  username: "",
  password: "",
};

const Login: NextPage = () => {
  const [formValues, setFormValues] = React.useState(defaultValues);
  const router = useRouter();

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/login", {
        method: "post",
        body: JSON.stringify(formValues),
      });

      if (response.ok) {
        router.push("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            id="standard-basic"
            label="Username"
            variant="outlined"
            name="username"
            value={formValues.username}
            onChange={handleInputChange}
          />
          <TextField
            id="standard-basic"
            label="Password"
            variant="outlined"
            type="password"
            name="password"
            value={formValues.password}
            onChange={handleInputChange}
          />
          <Button type="submit">Login</Button>
        </Stack>
      </form>
    </>
  );
};

export const getServerSideProps = withSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;

    if (user) {
      return {
        redirect: {
          permanent: false,
          destination: "/",
        },
      };
    }

    return {
      props: {},
    };
  }
);

export default Login;
