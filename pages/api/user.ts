import { withSessionRoute } from "../../lib/withSession";

export default withSessionRoute(userRoute);

function userRoute(req, res) {
  res.send({ user: req.session.user });
}
