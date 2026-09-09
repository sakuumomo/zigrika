const CameraSettings = @This();
const std = @import("std");
const pb = @import("proto").pb;

const Allocator = std.mem.Allocator;

pub const default: CameraSettings = .{};

camera_mode: i32 = 0,
pitch: f32 = 0,
yaw: f32 = 0,
roll: f32 = 0,
pos_x: f32 = 0,
pos_y: f32 = 0,
pos_z: f32 = 0,
fov: i32 = 0,
focus_distance: i32 = 0,
blur_radius: i32 = 0,
tilt_angle: i32 = 0,
weather: i32 = 0,
atmosphere: i32 = 0,
wind_direction: i32 = 0,

pub fn toProto(info: CameraSettings) pb.CameraParamInfo {
    return pb.CameraParamInfo{
        .CameraMode = info.camera_mode,
        .PitchValue = info.pitch,
        .YawValue = info.yaw,
        .RollValue = info.roll,
        .PosX = info.pos_x,
        .PosY = info.pos_y,
        .PosZ = info.pos_z,
        .Fov = info.fov,
        .FocusDistance = info.focus_distance,
        .BlurRadius = info.blur_radius,
        .CameraTiltAngle = info.tilt_angle,
        .Weather = info.weather,
        .Atmosphere = info.atmosphere,
        .WindDirection = info.wind_direction,
    };
}

pub fn fromProto(info: *CameraSettings, proto: pb.CameraParamInfo) void {
    info.camera_mode = proto.CameraMode;
    info.pitch = proto.PitchValue;
    info.yaw = proto.YawValue;
    info.roll = proto.RollValue;
    info.pos_x = proto.PosX;
    info.pos_y = proto.PosY;
    info.pos_z = proto.PosZ;
    info.fov = proto.Fov;
    info.focus_distance = proto.FocusDistance;
    info.blur_radius = proto.BlurRadius;
    info.tilt_angle = proto.CameraTiltAngle;
    info.weather = proto.Weather;
    info.atmosphere = proto.Atmosphere;
    info.wind_direction = proto.WindDirection;
}

pub fn deinit(info: CameraSettings, gpa: Allocator) void {
    std.zon.parse.free(gpa, info);
}
