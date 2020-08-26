const express = require('express');
const app = express();
const Task = require("./../models/task");
const { remove } = require('./../models/task');

//Mensaje
app.get('/', function (req, res) {
    res.json({
        'success': true,
        'message': 'Welcome to NODEJS + MONGODB + COMPASS + EXPRESSS',
        'data': []
    })
});

//Lista de tareas
app.get('/task', function (req, res) {
    Task.find({})
        .exec((err, taskList) => {
            if (err) {
                return res.json({
                    'success': false,
                    'message': err.message,
                    'data': []
                });
            }
            if (!taskList.length) {
                return res.json({
                    'success': false,
                    'message': 'The task array has no positions',
                    'data': []
                });
            }
            return res.json({
                'success': true,
                'message': 'Task List',
                'data': [taskList]
            })
        });

});

//Crear tarea
app.post('/task', function (req, res) {
    let data = req.body;
    let task = new Task({
        title: data.title,
        description: data.description,
        image_url: data.image_url,
    });

    task.save((err, taskDB) => {
        if (err) {
            return res.status(400).json({
                'success': false,
                'message': err,
                'data': []
            });
        }
        return res.json({
            'success': true,
            'message': 'Task saved successfully',
            'data': [taskDB]
        })
    });
});

//Buscar Tarea por Id
app.get('/task/:id', function (req, res) {
    let id = req.params.id;

    Task.findById(id)
        .exec((err, taskDetail) => {
            if (err) {
                return res.status(400).json({
                    'success': false,
                    'message': err.message,
                    'data': []
                });
            }
            if (!taskDetail) {
                return res.json({
                    'success': false,
                    'message': 'Task doesnt found',
                    'data': []
                });
            }
            return res.json({
                'success': true,
                'message': 'Task Detail',
                'data': [taskDetail]
            })
        });
});

//Actualizar la informacion
app.put('/task/:id', function (req, res) {
    let id = req.params.id;
    let data = req.body;

    const { title, description } = data;

    // Captura solo el titulo y la descripcion, cualquier otra info es ignorada
    let actualizar = { title, description };

    Task.findByIdAndUpdate(id, actualizar, {new : true,  runValidators: true}, (err, taskDB) => {
        if(err){
            return res.status(400).json({
                'success': false,
                'message' : err,
                'data' : []
            });
        }
        return res.json({
            'success': true,
            'message' : 'The information has been update successfully ',
            'data' : [taskDB]
        })
    });
});

/*  *******

     NOTA: despues de hacer el put de ((arriba)) al hacer patch de((abajo)) la primera 
     vez el estado no se actuliza, apartir de la segunda ves si lo hace

*/

// Cambiar el estado de activo a inactivo y viseversa
app.patch('/task/:id', function (req, res) {
    let id = req.params.id;
    Task.findById(id)
            .exec( (err, taskDetail) => {
                if(err){
                    return res.status(400).json({
                        'success': false,
                        'message' : 'Task not found',
                        'data' : []
                    });
                }
                ( taskDetail.active ? updateStatus( true, id, res ) : updateStatus ( false, id, res ) );
            });

        const updateStatus = ( estado, id, res ) => {
            let data = { active : ( estado ? false : true ) };
            Task.findByIdAndUpdate(id, data, {new : false,  runValidators: true}, (err, taskDB) => {
                if(err){
                    return res.status(400).json({
                        'success': false,
                        'message' : err,
                        'data' : []
                    });
                }
                if(!taskDB){
                    return res.json({
                        'success': false,
                        'message' : 'Task not found',
                        'data' : []
                    });
                }
                return res.json({
                    'success': true,
                    'message' : 'Task status has been update successfully',
                    'data' : [taskDB]
                })
            });
        }

    
});

// Eliminar la tarea
app.delete('/task/delete/:id', function (req, res) {
    let id = req.params.id;
    Task.findByIdAndDelete(id, (err, taskDB) => {
        if(err){
            return res.status(400).json({
                'success': false,
                'message' : err,
                'data' : []
            });
        }
        if(!taskDB){
            return res.json({
                'success': false,
                'message' : 'Task not found',
                'data' : []
            });
        }
        return res.json({
            'success': true,
            'message' : 'This Task has been deleted successfully',
            'data' : [taskDB]
        })
    });
});

module.exports = app;