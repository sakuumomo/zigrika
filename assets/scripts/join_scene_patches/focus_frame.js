const {
  FeatureRestrictionTemplate,
} = require("Game/Module/Common/FeatureRestrictionTemplate.js");
const {
  PhotographController,
} = require("../Game/Module/Photograph/PhotographController.js");
const { ByteBuffer } = require("../RunTimeLibs/FlatBuffers/byte-buffer");
const { Builder } = require("../RunTimeLibs/FlatBuffers/builder");
const { HotKeyMap } = require("../Core/Define/Config/HotKeyMap");
const {
  configHotKeyMapById,
} = require("../Core/Define/ConfigQuery/HotKeyMapById");
const {
  TsUiNavigationPanelConfig,
} = require("Game/Module/UiNavigation/New/TsUiNavigationPanelConfig.js");
const {
  UiNavigationViewHandle,
} = require("Game/Module/UiNavigation/New/UiNavigationViewHandle.js");
const { PrefabTextItem } = require("../Core/Define/Config/PrefabTextItem");
const {
  configPrefabTextItemByItemId,
} = require("../Core/Define/ConfigQuery/PrefabTextItemByItemId");
const {
  HotKeyItemFactory,
} = require("Game/Module/UiNavigation/UIItem/HotKeyItemFactory.js");
const {
  CommonDropDown,
} = require("Game/Module/Common/DropDown/CommonDropDown.js");
const {
  PhotoCameraInputComponent,
} = require("Game/Camera/FightCameraController/SpecialGameplay/PhotoCamera/Component/PhotoCameraInputComponent.js");
const {
  PhotoMainViewModel,
} = require("Game/Module/Photograph/MainView/PhotoMainViewModel.js");
const {
  configCommonParamById,
} = require("Core/Define/ConfigCommon/CommonParamById.js");
const {
  PhotoRightPanel,
} = require("Game/Module/Photograph/MainView/Item/PhotoRightPanel.js");
const {
  PhotoMainView,
} = require("Game/Module/Photograph/MainView/PhotoMainView.js");
const {
  InputDistributeController,
} = require("Game/Ui/InputDistribute/InputDistributeController.js");
const {
  axisMappings,
} = require("Game/Ui/InputDistribute/InputMappingsDefine.js");
const {
  PhotoCamera,
} = require("Game/Camera/FightCameraController/SpecialGameplay/PhotoCamera/PhotoCamera.js");
const {
  PhotoCameraUtil,
} = require("Game/Camera/FightCameraController/SpecialGameplay/PhotoCamera/PhotoCameraUtil.js");
const { UiManager } = require("Game/Ui/UiManager.js");
const { EffectSystem } = require("Game/Effect/EffectSystem.js");

const MISSING_HOTKEY_IDS = new Set([9160, 9161, 9164, 9165, 9167, 9168]);
const FALLBACK_PREFAB = {
  prefabPathHash: BigInt("1628712462"),
  itemPath: "BtnConfirmA/TxtConfirm",
  text: "PrefabTextItem_Default_Text",
};
const MISSING_PREFAB_TEXT_IDS = new Set([
  BigInt("3905313257"),
  BigInt("3348943583"),
  BigInt("2746019478"),
  BigInt("1123496250"),
  BigInt("427581896"),
  BigInt("3207045866"),
]);

FeatureRestrictionTemplate.prototype.CNn = function () {
  return 0;
};

const build_hotkey_map = (id) => {
  const b = new Builder(256);
  const actionname_off = b.createString("");
  const axisname_off = b.createString("");
  const textid_off = b.createString("");
  const type_off = b.createString("ShowOnly");
  const bindbuttontag_off = b.createString("");

  b.startObject(12);
  b.addFieldInt32(0, id, 0);
  b.addFieldOffset(1, actionname_off, 0);
  b.addFieldOffset(2, axisname_off, 0);
  b.addFieldInt32(3, 0, 0);
  b.addFieldOffset(4, textid_off, 0);
  b.addFieldOffset(5, type_off, 0);
  b.addFieldInt32(6, 0, 0);
  b.addFieldInt32(7, 0, 0);
  b.addFieldOffset(8, bindbuttontag_off, 0);
  b.addFieldInt32(9, 2, 0);
  b.addFieldInt8(10, 1, 0);
  b.addFieldInt8(11, 0, 0);
  const root = b.endObject();
  b.finish(root);
  return HotKeyMap.getRootAsHotKeyMap(new ByteBuffer(b.asUint8Array()));
};

const hotkey_patch_cache = new Map();

const get_or_build_hotkey_patch = (id) => {
  if (!hotkey_patch_cache.has(id)) {
    hotkey_patch_cache.set(id, build_hotkey_map(id));
  }
  return hotkey_patch_cache.get(id);
};

configHotKeyMapById.GetConfig = (
  (orig) =>
  (id, ...args) => {
    if (MISSING_HOTKEY_IDS.has(id)) {
      return get_or_build_hotkey_patch(id);
    }
    return orig(id, ...args);
  }
)(configHotKeyMapById.GetConfig.bind(configHotKeyMapById));

HotKeyItemFactory.CreateHotKeyComponent = (function (orig) {
  return async function (actor, hotKeyMapId, hotKeyType) {
    try {
      return await orig.call(this, actor, hotKeyMapId, hotKeyType);
    } catch (e) {
      return undefined;
    }
  };
})(HotKeyItemFactory.CreateHotKeyComponent);

TsUiNavigationPanelConfig.prototype.AddHotKeyItem = (function (orig) {
  return function (hotKeyItem) {
    if (!hotKeyItem) return;
    orig.call(this, hotKeyItem);
  };
})(TsUiNavigationPanelConfig.prototype.AddHotKeyItem);

TsUiNavigationPanelConfig.prototype.RefreshHotKeyComponents = function () {
  if (!this.HotKeyItemSet) return;
  for (const i of this.HotKeyItemSet) {
    if (!i) continue;
    for (const t of i.GetHotKeyComponentArray()) {
      if (!t) continue;
      t.RefreshSelfHotKeyState(this.ViewHandle);
      t.RefreshSelfHotKeyText(this.ViewHandle);
    }
  }
};

UiNavigationViewHandle.prototype.Pbo = (function (orig) {
  return function () {
    try {
      orig.call(this);
    } catch (e) {}
  };
})(UiNavigationViewHandle.prototype.Pbo);

const build_prefab_text_item = ({ itemId, prefabPathHash, itemPath, text }) => {
  const b = new Builder(256);
  const itemPath_off = b.createString(itemPath);
  const text_off = b.createString(text);
  b.startObject(4);
  b.addFieldInt64(0, itemId, BigInt(0));
  b.addFieldInt64(1, prefabPathHash, BigInt(0));
  b.addFieldOffset(2, itemPath_off, 0);
  b.addFieldOffset(3, text_off, 0);
  const root = b.endObject();
  b.finish(root);
  return PrefabTextItem.getRootAsPrefabTextItem(
    new ByteBuffer(b.asUint8Array()),
  );
};

const prefab_patch_cache = new Map();

const get_or_build_prefab_patch = (bigId) => {
  if (!prefab_patch_cache.has(bigId)) {
    prefab_patch_cache.set(
      bigId,
      build_prefab_text_item({
        itemId: bigId,
        ...FALLBACK_PREFAB,
      }),
    );
  }
  return prefab_patch_cache.get(bigId);
};

configPrefabTextItemByItemId.GetConfig = (
  (orig) =>
  (id, ...args) => {
    const bigId = BigInt(id);
    if (MISSING_PREFAB_TEXT_IDS.has(bigId)) {
      return get_or_build_prefab_patch(bigId);
    }
    return orig(id, ...args);
  }
)(configPrefabTextItemByItemId.GetConfig.bind(configPrefabTextItemByItemId));

CommonDropDown.prototype.SetSelectedIndex = (function (orig) {
  return function (t, i = true) {
    const item = this.eGe?.GetLayoutItemByKey(t);
    if (!item) return;
    orig.call(this, t, i);
  };
})(CommonDropDown.prototype.SetSelectedIndex);

CommonDropDown.prototype.InitScroll = (function (orig) {
  return function (t, i, s = 0, e = true) {
    if (this.eGe) {
      for (const h of this.eGe.GetLayoutItemList()) {
        if (!h) continue;
        h.SetToggleForce(false);
      }
    }
    try {
      orig.call(this, t, i, s, e);
    } catch (err) {}
  };
})(CommonDropDown.prototype.InitScroll);

EffectSystem.SetEffectStoppingTimeFromEntity = (function (orig) {
  return function (entityId, bStop, source) {
    try {
      return orig.call(this, entityId, bStop, source);
    } catch (e) {}
  };
})(EffectSystem.SetEffectStoppingTimeFromEntity);

TsUiNavigationPanelConfig.prototype.HandleAsyncHotKeyState = (function (orig) {
  return async function (hotKeyItem) {
    if (!hotKeyItem) return;
    try {
      return await orig.call(this, hotKeyItem);
    } catch (e) {}
  };
})(TsUiNavigationPanelConfig.prototype.HandleAsyncHotKeyState);

TsUiNavigationPanelConfig.prototype.SetHotKeyVisibleMode = (function (orig) {
  return function (hotKeyItem, mode) {
    if (!hotKeyItem) return;
    try {
      return orig.call(this, hotKeyItem, mode);
    } catch (e) {}
  };
})(TsUiNavigationPanelConfig.prototype.SetHotKeyVisibleMode);

PhotoCamera.prototype.OnInit = (function (orig) {
  return function (t, i) {
    if (this.j1y === undefined) {
      this.j1y = 0;
    }
    orig.call(this, t, i);
  };
})(PhotoCamera.prototype.OnInit);

PhotoCameraUtil.IsMoveBlocked = (function (orig) {
  return function () {
    if (UiManager.IsViewShow("PhotoMainView")) return false;
    return orig();
  };
})(PhotoCameraUtil.IsMoveBlocked);

PhotoMainView.prototype.OnAddEventListener = (function (orig) {
  return function () {
    orig.call(this);

    InputDistributeController.UnBindAxis(axisMappings.UiMoveForward, this.vWi);
    InputDistributeController.UnBindAxis(axisMappings.UiMoveRight, this.MWi);
    InputDistributeController.UnBindAxis(axisMappings.UiLookInOut, this.lYp);
    InputDistributeController.UnBindAxis(axisMappings.UiCamRotate2, this.tIv);

    this.vWi = (t, i) => {
      if (i !== 0)
        InputDistributeController.InputAxis(axisMappings.PhotoMoveUp, i, true);
    };
    this.MWi = (t, i) => {
      if (i !== 0)
        InputDistributeController.InputAxis(
          axisMappings.PhotoMoveRight,
          i,
          true,
        );
    };
    this.lYp = (t, i) => {
      if (i !== 0)
        InputDistributeController.InputAxis(
          axisMappings.PhotoMoveForward,
          i,
          true,
        );
    };
    this.tIv = (t, i) => {
      if (i !== 0)
        InputDistributeController.InputAxis(axisMappings.PhotoRoll, i, true);
    };

    InputDistributeController.BindAxis(axisMappings.UiMoveForward, this.vWi);
    InputDistributeController.BindAxis(axisMappings.UiMoveRight, this.MWi);
    InputDistributeController.BindAxis(axisMappings.UiLookInOut, this.lYp);
    InputDistributeController.BindAxis(axisMappings.UiCamRotate, this.tIv);
  };
})(PhotoMainView.prototype.OnAddEventListener);

PhotoMainView.prototype.OnRemoveEventListener = (function (orig) {
  return function () {
    InputDistributeController.UnBindAxis(axisMappings.UiMoveForward, this.vWi);
    InputDistributeController.UnBindAxis(axisMappings.UiMoveRight, this.MWi);
    InputDistributeController.UnBindAxis(axisMappings.UiLookInOut, this.lYp);
    InputDistributeController.UnBindAxis(axisMappings.UiCamRotate, this.tIv);
    orig.call(this);
  };
})(PhotoMainView.prototype.OnRemoveEventListener);

const origOnActivate = PhotoCameraInputComponent.prototype.OnActivate;
PhotoCameraInputComponent.prototype.OnActivate = function () {
  this._maxUp = 0;
  this._maxRight = 0;
  this._maxForward = 0;
  this._maxPitch = 0;
  this._maxYaw = 0;
  this._maxRoll = 0;
  this._maxFov = 0;

  const origS1y = this.S1y;
  this.S1y = (t, e) => {
    if (e !== 0) this._maxUp = e;
    return origS1y(t, e);
  };
  const origY1y = this.y1y;
  this.y1y = (t, e) => {
    if (e !== 0) this._maxRight = e;
    return origY1y(t, e);
  };
  const origV1y = this.v1y;
  this.v1y = (t, e) => {
    if (e !== 0) this._maxForward = e;
    return origV1y(t, e);
  };
  const origM1y = this.M1y;
  this.M1y = (t, e) => {
    if (e !== 0) this._maxPitch = e;
    return origM1y(t, e);
  };
  const origE1y = this.E1y;
  this.E1y = (t, e) => {
    if (e !== 0) this._maxYaw = e;
    return origE1y(t, e);
  };
  const origI1y = this.I1y;
  this.I1y = (t, e) => {
    if (e !== 0) this._maxRoll = e;
    return origI1y(t, e);
  };
  const origT1y = this.T1y;
  this.T1y = (t, e) => {
    if (e !== 0) this._maxFov = e;
    return origT1y(t, e);
  };

  origOnActivate.call(this);
};

PhotoCameraInputComponent.prototype.OnTick = (function (orig) {
  return function (t) {
    if (this._maxUp !== 0) {
      this.g1y.MoveForward = this._maxUp;
      this._maxUp = 0;
    }
    if (this._maxRight !== 0) {
      this.g1y.MoveRight = this._maxRight;
      this._maxRight = 0;
    }
    if (this._maxForward !== 0) {
      this.g1y.MoveUp = this._maxForward;
      this._maxForward = 0;
    }
    if (this._maxPitch !== 0) {
      this.g1y.Pitch = this._maxPitch;
      this._maxPitch = 0;
    }
    if (this._maxYaw !== 0) {
      this.g1y.Yaw = this._maxYaw;
      this._maxYaw = 0;
    }
    if (this._maxRoll !== 0) {
      this.g1y.Roll = this._maxRoll;
      this._maxRoll = 0;
    }
    if (this._maxFov !== 0) {
      this.g1y.Fov = this._maxFov;
      this._maxFov = 0;
    }
    orig.call(this, t);
  };
})(PhotoCameraInputComponent.prototype.OnTick);

PhotoMainView.prototype.OnAfterPlayStartSequence = (function (orig) {
  return function () {
    orig?.call(this);

    this.GetItem(3)?.SetUIActive(true);
    this.GetItem(4)?.SetUIActive(true);

    if (this.tf0) {
      this.tf0.GetItem(0)?.SetUIActive(true);
      this.tf0.GetItem(4)?.SetUIActive(true);
    }

    if (this.JAu) {
      this.JAu.GetItem(13)?.SetUIActive(true);
      this.JAu.GetItem(14)?.SetUIActive(true);
    }

    this.dSl(true);
    this.tf0.zJS();
  };
})(PhotoMainView.prototype.OnAfterPlayStartSequence);

PhotoMainViewModel.prototype.PlaySwitchModeAnimAsync = (function (orig) {
  return async function (t) {
    if (!this.OnRequestPlaySwitchModeAnim) {
      return;
    }
  };
})(PhotoMainViewModel.prototype.PlaySwitchModeAnimAsync);

const origGetIntConfig = configCommonParamById.GetIntConfig.bind(
  configCommonParamById,
);
configCommonParamById.GetIntConfig = (key, ...args) => {
  if (key === "WAIT_CHANGE_ROLE_TIMEOUT_MS") return 10000;
  return origGetIntConfig(key, ...args);
};

PhotoRightPanel.prototype._eM = (function (orig) {
  return async function (t) {
    const camera = this.M_y();

    if (camera) {
      const origSwitch = camera.SwitchMode?.bind(camera);
      camera.SwitchMode = async (mode, path) => {
        try {
          const r = await origSwitch(mode, path);
          return r;
        } catch (e) {}
      };
    }

    try {
      await orig.call(this, t);
    } catch (e) {}
  };
})(PhotoRightPanel.prototype._eM);

PhotographController.CheckCanOpenPhotograph = function (t) {
  return true;
};
PhotographController.mKa = function () {
  return true;
};
