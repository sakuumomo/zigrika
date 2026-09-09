const std = @import("std");
const pb = @import("proto").pb;
const common = @import("common");
const mem = @import("../../mem.zig");
const PlayerSettingsComponent = @import("../../logic/component/player/PlayerSettingsComponent.zig");
const Transaction = @import("../handlers.zig").Transaction;

const FileSystem = common.FileSystem;

pub fn onLanguageSettingUpdateRequest(txn: *Transaction(pb.LanguageSettingUpdateRequest)) !void {
    txn.respond(.{ .ErrorCode = .Success });
}

pub fn onInputSettingRequest(txn: *Transaction(pb.InputSettingRequest)) !void {
    txn.respond(.{});
}

pub fn onInputSettingUpdateRequest(txn: *Transaction(pb.InputSettingUpdateRequest)) !void {
    txn.respond(.{ .ErrorCode = .Success });
}

pub fn onCameraSettingQueryRequest(
    txn: *Transaction(pb.CameraSettingQueryRequest),
    settings_comp: *PlayerSettingsComponent,
) !void {
    txn.respond(.{
        .CameraSetting = .{
            .CameraParam = settings_comp.camera.toProto(),
        },
    });
}

pub fn onCameraSettingModifyRequest(
    txn: *Transaction(pb.CameraSettingModifyRequest),
    settings_comp: *PlayerSettingsComponent,
    fs: *FileSystem,
    alloc: mem.Alloc,
) !void {
    if (txn.message.CameraSetting) |setting| {
        if (setting.CameraParam) |param| {
            settings_comp.camera.fromProto(param);
            try settings_comp.save(fs, alloc.arena);
        }
    }

    txn.respond(.{});
}
