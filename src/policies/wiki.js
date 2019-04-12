const ApplicationPolicy = require("./application");

module.exports = class WikiPolicy extends ApplicationPolicy {
  newPublic() {
    return (
      super.new() &&
      (super._isAdmin() || super._isStandardUser() || super._isPremiumUser())
    );
  }
  editPublic() {
    return this.record && this.newPublic();
  }
  updatePublic(updatedRecord) {
    if (updatedRecord.hasOwnProperty("private") && updatedRecord.private == 'true') {
      return (super.new() && this.record && (super._isAdmin() || (super._isPremiumUser() && super._isOwner())));
    }
    return this.editPublic();
  }
  destroyPublic() {
    return this.editPublic() && (super._isOwner() || super._isAdmin());
  }
  newPrivate() {
    return super.new() && (super._isAdmin() || super._isPremiumUser());
  }
  editPrivate() {
    return (
      super.new() &&
      this.record &&
      (super._isAdmin() || (super._isPremiumUser() && super._isOwner()))
    );
  }
  updatePrivate() {
    return this.editPrivate();
  }
  destroyPrivate() {
    return this.updatePrivate();
  }
  showPrivate() {
    return (
      this.record &&
      ((super._isPremiumUser() && super._isOwner()) || super._isAdmin())
    );
  }
};
