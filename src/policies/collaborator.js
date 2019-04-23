const ApplicationPolicy = require("./application");

module.exports = class CollaboratorPolicy extends ApplicationPolicy {
  show(){
    return (
      super.new() &&
      this.record &&
      (super._isAdmin() || (super._isPremiumUser() && super._isOwner()))
    );
  }
  create() {
    return this.show();
  }
  destroy() {
    return this.create();
  }
};
