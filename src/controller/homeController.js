import db from "../models/index";
import CRUDService from "../services/CRUDServies";
let getHomePage = (req, res) => {
  return res.render("homepage.ejs");
};
let getCRUD = (req, res) => {
  return res.render("crud.ejs");
};
let postCRUD = async (req, res) => {
  let message = await CRUDService.createNewUser(req.body);
  console.log(message);
};
let displayCRUD = async (req, res) => {
  let data = await CRUDService.getAllUser();
  console.log(data);
};

module.exports = {
  getHomePage: getHomePage,
  getCRUD: getCRUD,
  postCRUD: postCRUD,
  displayCRUD: displayCRUD,
};
