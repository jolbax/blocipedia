const ApplicationPolicy = require("./application");

module.exports = class UserPolicy extends ApplicationPolicy {
  signUp(){
    return this.user == null;
  }
  create() {
    return this.signUp();
  }
  show() {
    return this.user && ( this.user.id == this.record.id || super._isAdmin());
  }

  edit() {
    return this.show();
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }
};
