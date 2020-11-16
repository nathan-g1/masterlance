// module.exports = function (app) {
//     var Role = app.models.Role;

//     const createOwnerResolver = (userModelName) => function (role, context, cb) {

//         if (context.modelName !== userModelName)
//             return process.nextTick(() => cb(null, false));

//         var userId = context.accessToken[`${userModelName.toLowerCase()}Id`];
//         if (!userId) {
//             return process.nextTick(() => cb(null, false));
//         }

//         if (String(userId) === String(context.modelId)) {
//             return process.nextTick(() => cb(null, true));
//         }
//         else {
//             return process.nextTick(() => cb(null, false));
//         }
//     }

//     Role.registerResolver('Client', createOwnerResolver('Client'));
//     Role.registerResolver('Freelancer', createOwnerResolver('Freelancer'));
// };
