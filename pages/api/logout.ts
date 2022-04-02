import { withSessionRoute } from "../../lib/withSession";

export default withSessionRoute(logoutRoute);

function logoutRoute(req, res) {
  req.session.destroy();
  res.send({ ok: true });
}
