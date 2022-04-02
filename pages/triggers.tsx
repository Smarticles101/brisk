import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import type { NextPage } from "next";
import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import Slide from "@mui/material/Slide";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "../styles/Home.module.css";
import { withSessionSsr } from "../lib/withSession";
import { DataGrid } from "@mui/x-data-grid";
import { getTriggers } from "./api/triggers";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Triggers: NextPage = (props) => {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [type, setType] = React.useState(0);

  const [selectionModel, setSelectionModel] = React.useState([]);

  const [triggers, setTriggers] = React.useState(props.triggers);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmitNewTrigger = () => {
    fetch("/api/triggers", {
      method: "POST",
      body: JSON.stringify({
        name,
        type,
      }),
    })
      .then((resp) => resp.json())
      .then((trigger) => {
        setTriggers([...triggers, trigger]);
      });

    handleClose();
  };

  const handleDeleteSelectedTriggers = () => {
    fetch("/api/triggers", {
      method: "DELETE",
      body: JSON.stringify({ triggers: selectionModel }),
    })
      .then((resp) => resp.json())
      .then(() => {
        setTriggers(
          triggers.filter((trigger) => !selectionModel.includes(trigger._id))
        );
      });
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
    },
    {
      field: "type",
      headerName: "Trigger Type",
    },
  ];

  return (
    <>
      <DataGrid
        getRowId={(row) => row._id}
        columns={columns}
        rows={triggers}
        checkboxSelection
        onSelectionModelChange={(ids) => {
          setSelectionModel(ids);
        }}
        components={{
          Toolbar: () => {
            return (
              <Toolbar>
                <Tooltip title="Delete">
                  <IconButton onClick={handleDeleteSelectedTriggers}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Toolbar>
            );
          },
        }}
      />

      <Dialog
        fullScreen
        open={open}
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
              New Trigger
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSubmitNewTrigger}>
              save
            </Button>
          </Toolbar>
        </AppBar>
        <Stack spacing={2} p={2}>
          <TextField
            id="outlined-basic"
            label="Title"
            variant="outlined"
            value={name}
            onChange={(evt) => setName(evt.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Trigger Type</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={type}
              label="Age"
              onChange={(evt) => setType(evt.target.value as number)}
            >
              <MenuItem value={1}>Type 1</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleClickOpen}
        className={styles.fab}
      >
        <AddIcon />
      </Fab>
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
          destination: "/login",
        },
      };
    }

    const triggers = JSON.parse(JSON.stringify(await getTriggers()));

    return {
      props: {
        user: req.session.user,
        triggers,
      },
    };
  }
);

export default Triggers;
