const PlayerSettingsComponent = @This();
const std = @import("std");
const common = @import("common");
const file_util = @import("../../../fs/file_util.zig");
const CameraSettings = @import("../../../fs/CameraSettings.zig");

const Allocator = std.mem.Allocator;
const FileSystem = common.FileSystem;

player_id: i32,
camera: CameraSettings,

pub fn init(gpa: Allocator, fs: *FileSystem, player_id: i32) !PlayerSettingsComponent {
    var arena_state = std.heap.ArenaAllocator.init(gpa);
    defer arena_state.deinit();
    const arena = arena_state.allocator();

    return .{
        .player_id = player_id,
        .camera = try file_util.loadOrCreateZon(
            CameraSettings,
            gpa,
            arena,
            fs,
            "player/{}/settings/camera",
            .{player_id},
        ),
    };
}

pub fn deinit(comp: *PlayerSettingsComponent, gpa: Allocator) void {
    comp.camera.deinit(gpa);
}

pub fn save(comp: *PlayerSettingsComponent, fs: *FileSystem, arena: Allocator) !void {
    const path = try std.fmt.allocPrint(arena, "player/{}/settings/camera", .{comp.player_id});
    const serialized = try file_util.serializeZon(arena, comp.camera);
    try fs.writeFile(path, serialized);
}
