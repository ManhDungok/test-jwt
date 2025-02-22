import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import bluebird from 'bluebird';
import db from '../models/index';

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (userPassword) => {
	let hashPassword = bcrypt.hashSync(userPassword, salt);
	return hashPassword;
};

const createNewUser = async (email, password, username) => {
	let hashPass = hashUserPassword(password);
	// const connection = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'jwt', Promise: bluebird });

	//Tao moi 1 user
	try {
		// const [rows, fields] = await connection.execute('INSERT INTO `user` (email, password, username) VALUES(?, ?, ?)', [email, hashPass, username]);
		await db.User.create({
			//Dung theo cach sequelize
			username: username,
			email: email,
			password: hashPass
		});
	} catch (error) {
		console.log('>>check error: ', error);
	}
};

const getUserList = async () => {
	let newUser = await db.User.findOne({
		where: { id: 1 },
		attributes: ['id', 'username', 'email'],
		include: {
			model: db.Group,
			attributes: ['name', 'description']
		},
		raw: true,
		nest: true
	});

	let r = await db.Role.findAll({
		include: { model: db.Group, where: { id: 1 } },
		raw: true,
		nest: true
	});

	//lam theo sequelize
	let users = [];
	users = await db.User.findAll();
	return users;
};

const deleteUser = async (userId) => {
	// const connection = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'jwt', Promise: bluebird });

	// try {
	//     const [rows, fields] = await connection.execute('DELETE FROM user WHERE id=?', [id]);
	//     return rows;
	// } catch (error) {
	//     console.log(">>> check error: ", error)
	// }
	await db.User.destroy({
		where: {
			id: userId
		}
	});
};

const getUserById = async (id) => {
	// const connection = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'jwt', Promise: bluebird });

	// try {
	//     const [rows, fields] = await connection.execute('Select * FROM user WHERE id=?', [id]);
	//     return rows;
	// } catch (error) {
	//     console.log(">>> check error: ", error)
	// }
	let user = {};
	user = await db.User.findOne({
		where: { id: id }
	});
	return (user = user.get({ plain: true }));
};

const updateUserInfor = async (email, username, id) => {
	// const connection = await mysql.createConnection({ host: 'localhost', user: 'root', database: 'jwt', Promise: bluebird });

	// try {
	//     const [rows, fields] = await connection.execute('UPDATE user SET email = ?, username = ? where id=?', [email, username, id]);
	//     return rows;
	// } catch (error) {
	//     console.log(">>> check error: ", error)
	// }
	await db.User.update(
		{
			email: email,
			username: username
		},
		{
			where: { id: id }
		}
	);
};

module.exports = {
	createNewUser,
	getUserList,
	deleteUser,
	getUserById,
	updateUserInfor
};
