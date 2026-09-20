const std = @import("std");
const pb = @import("proto").pb;
const common = @import("common");
const mem = @import("../../mem.zig");
const PlayerSettingsComponent = @import("../../logic/component/player/PlayerSettingsComponent.zig");
const Transaction = @import("../handlers.zig").Transaction;
const Scene = @import("../../logic/Scene.zig");

const FileSystem = common.FileSystem;

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

pub fn onSelfPortraitStateRequest(
    txn: *Transaction(pb.SelfPortraitStateRequest),
    scene: *Scene,
    alloc: mem.Alloc,
    io: std.Io,
) !void {
    var switch_role_notify: pb.SwitchRoleNotify = .{
        .PlayerId = scene.player_id,
        .transform = .{ .Transform = .{
            .Pos = .{ .X = scene.instance.players[0].location[0], .Y = scene.instance.players[0].location[1], .Z = scene.instance.players[0].location[2] },
            .Rot = .{ .Roll = scene.instance.players[0].rotation[0], .Pitch = scene.instance.players[0].rotation[1], .Yaw = scene.instance.players[0].rotation[2] },
        } },
    };
    const current_formation = &scene.formation_info.formations[@intCast(scene.formation_info.cur_formation)];
    for (current_formation.roles) |maybe_slot| {
        const slot = maybe_slot orelse continue;
        if (slot.role_id == current_formation.cur_role) {
            switch_role_notify.DownEntityId = slot.entity_id;
            switch_role_notify.UpEntityId = slot.entity_id;
            break;
        }
    }

    try txn.conn.push(alloc.gpa, io, switch_role_notify);

    txn.respond(.{});
}
