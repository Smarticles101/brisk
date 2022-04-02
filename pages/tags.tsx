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
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "../styles/Home.module.css";
import { withSessionSsr } from "../lib/withSession";
import { getTags } from "./api/tags";
import { getTriggers } from "./api/triggers";
import { DataGrid } from "@mui/x-data-grid";
import { getTagTemplates } from "../lib/tagTemplates";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const Tags: NextPage = (props) => {
  const [newTagDialogOpen, setNewTagDialogOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [code, setCode] = React.useState("");
  const [trigger, setTrigger] = React.useState("");

  const [tagTypeDialogOpen, setTagTypeDialogOpen] = React.useState(false);
  const [tagTemplate, setTagTemplate] = React.useState("");
  const [tagParameters, setTagParameters] = React.useState({});

  const [selectionModel, setSelectionModel] = React.useState([]);

  const [tags, setTags] = React.useState(props.tags);
  const [triggers, setTriggers] = React.useState(props.triggers);

  const handleClickOpen = () => {
    setTagTypeDialogOpen(true);
  };

  const handleCloseNewTagDialog = () => {
    setNewTagDialogOpen(false);
  };

  const chooseTemplate = (template) => {
    setTagTemplate(template);
    setTagTypeDialogOpen(false);
    setNewTagDialogOpen(true);
  };

  const handleCloseTagTypeDialog = () => {
    setTagTypeDialogOpen(false);
  };

  const handleSubmitNewTag = () => {
    fetch("/api/tags", {
      method: "POST",
      body: JSON.stringify({
        name,
        code: tagTemplate === "" ? code : undefined,
        trigger,
        template: tagTemplate !== "" ? tagTemplate : undefined,
        parameters: tagTemplate !== "" ? tagParameters : undefined,
      }),
    })
      .then((resp) => resp.json())
      .then((tag) => {
        setTags([...tags, tag]);
      });

    handleCloseNewTagDialog();
  };

  const handleDeleteSelectedTags = () => {
    fetch("/api/tags", {
      method: "DELETE",
      body: JSON.stringify({ tags: selectionModel }),
    })
      .then((resp) => resp.json())
      .then(() => {
        setTags(tags.filter((tag) => !selectionModel.includes(tag._id)));
      });
  };

  const columns = [
    {
      field: "name",
      headerName: "Name",
    },
  ];

  return (
    <>
      <DataGrid
        getRowId={(row) => row._id}
        columns={columns}
        rows={tags}
        checkboxSelection
        onSelectionModelChange={(ids) => {
          setSelectionModel(ids);
        }}
        components={{
          Toolbar: () => {
            return (
              <Toolbar>
                <Tooltip title="Delete">
                  <IconButton onClick={handleDeleteSelectedTags}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Toolbar>
            );
          },
        }}
      />

      <Dialog onClose={handleCloseTagTypeDialog} open={tagTypeDialogOpen}>
        <DialogTitle>Select Tag Type</DialogTitle>
        <List sx={{ pt: 0 }}>
          <ListItem
            button
            onClick={() => chooseTemplate("")}
          >
            <ListItemText primary={"Default"} />
          </ListItem>
          {props.templates.map((template) => (
            <ListItem
              button
              onClick={() => chooseTemplate(template.name)}
              key={template.name}
            >
              <ListItemText primary={template.content.title} />
            </ListItem>
          ))}
        </List>
      </Dialog>

      <Dialog
        fullScreen
        open={newTagDialogOpen}
        onClose={handleCloseNewTagDialog}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleCloseNewTagDialog}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              New Tag
            </Typography>
            <Button autoFocus color="inherit" onClick={handleSubmitNewTag}>
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
          {tagTemplate === "" ? <TextField
            id="outlined-basic"
            label="Tag Code"
            variant="outlined"
            multiline
            value={code}
            onChange={(evt) => setCode(evt.target.value)}
          /> : 
          props.templates.find((template) => template.name === tagTemplate).content.parameters.map((parameter) => (
            <TextField
              id="outlined-basic"
              label={parameter}
              key={parameter}
              onChange={(evt) => setTagParameters({...tagParameters, [parameter]: evt.target.value})}
            />
          ))
          }
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            label="Trigger"
            value={trigger}
            onChange={(evt) => setTrigger(evt.target.value)}
          >
            {triggers.map((trigger) => (
              <MenuItem key={trigger._id} value={trigger._id}>
                {trigger.name}
              </MenuItem>
            ))}
          </Select>
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

    const tags = JSON.parse(JSON.stringify(await getTags()));
    const triggers = JSON.parse(JSON.stringify(await getTriggers()));

    const templates = await getTagTemplates();

    return {
      props: {
        user: req.session.user,
        tags,
        triggers,
        templates,
      },
    };
  }
);

export default Tags;
