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
