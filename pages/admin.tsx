import type { NextPage } from "next";
import React from "react";
import {
  AppBar,
  Button,
  Checkbox,
  Dialog,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Slide,
  Stack,
  Switch,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { DataGrid } from "@mui/x-data-grid";
import { withSessionSsr } from "../lib/withSession";
import { getUsers } from "./api/users";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const getServerSideProps = withSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;

    if (!user) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      };
    }

    if (user.admin !== true) {
      return {
        notFound: true,
      };
    }

    const users = await getUsers();

    return {
      props: {
        user: req.session.user,
        users: JSON.parse(JSON.stringify(users)),
      },
    };
  }
);

const Admin: NextPage = (props) => {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = React.useState(false);

  const [users, setUsers] = React.useState(props.users);
  const [selectionModel, setSelectionModel] = React.useState([]);

  const [newUsername, setNewUsername] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [newAdmin, setNewAdmin] = React.useState(false);

  const handleClickOpen = () => {
    setIsAddUserDialogOpen(true);
  };

  const handleClose = () => {
    setNewUsername("");
    setNewPassword("");
    setNewAdmin(false);

    setIsAddUserDialogOpen(false);
  };

  const handleSubmitNewUser = () => {
    const newUser = {
      username: newUsername,
      password: newPassword,
      admin: newAdmin,
    };

    fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(newUser),
    })
      .then((resp) => resp.json())
      .then((user) => {
        setUsers([...users, user]);
      });

    handleClose();
  };

  const handleDeleteSelectedUsers = () => {
    fetch("/api/users", {
      method: "DELETE",
      body: JSON.stringify({users: selectionModel}),
    })
      .then((resp) => resp.json())
      .then(() => {
        setUsers(
          users.filter((user) => !selectionModel.includes(user._id))
        );
      });
  };

  const columns = [
    {
      field: "username",
      headerName: "Username",
    },
    {
      field: "admin",
      headerName: "Is Admin",
    },
  ];

  return (
    <>
      <Typography variant="h4">Admin</Typography>
      <DataGrid
        getRowId={(row) => row._id}
        columns={columns}
        rows={users}
        checkboxSelection
        onSelectionModelChange={(ids) => {
          console.log(ids);
          setSelectionModel(ids);
        }}
        components={{
          Toolbar: () => {
            return (
              <Toolbar>
                <Tooltip title="Delete">
                  <IconButton onClick={handleDeleteSelectedUsers}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add user">
                  <IconButton onClick={handleClickOpen}>
                    <AddIcon />
                  </IconButton>
                </Tooltip>
              </Toolbar>
            );
          },
        }}
      />

      <Dialog
        fullScreen
        open={isAddUserDialogOpen}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              New User
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSubmitNewUser}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <Stack spacing={2} p={2}>
          <TextField
            id="outlined-basic"
            label="Username"
            variant="outlined"
            value={newUsername}
            onChange={(evt) => setNewUsername(evt.target.value)}
          />
          <FormControlLabel
            control={
              <Switch
                value={newAdmin}
                onChange={(evt) => setNewAdmin(evt.target.checked)}
              />
            }
            label="Admin"
          />
          <TextField
            id="outlined-basic"
            label="Password"
            variant="outlined"
            type="password"
            value={newPassword}
            onChange={(evt) => setNewPassword(evt.target.value)}
          />
        </Stack>
      </Dialog>
    </>
  );
};

export default Admin;
