from flask import Flask, abort, render_template, request, redirect, url_for, flash
import sqlite3
from datetime import datetime

app = Flask(__name__)

def get_db():
    conn = sqlite3.connect('demandas.db')
    conn.row_factory = sqlite3.Row
    return conn


@app.route('/')
def index():
    conn = get_db()
    cursor = conn.cursor()
    demandas = cursor.execute('SELECT * FROM demandas').fetchall()
    conn.close()
    return render_template('index.html', demandas=demandas)


@app.route('/nova_demanda', methods=['GET', 'POST'])
def nova_demanda():
    if request.method == 'POST':
        titulo = request.form['titulo']
        descricao = request.form['descricao']
        solicitante = request.form['solicitante']


        conn = get_db()
        cursor = conn.cursor()

        cursor.execute(
            "INSERT INTO demandas (titulo, descricao, solicitante, data_criacao) VALUES (?, ?, ?, ?)",
            (titulo, descricao, solicitante, datetime.now()),
        )
        conn.commit()
        conn.close()

        flash('Salvo!')
        return redirect('/')

    return render_template('nova_demanda.html')


@app.route('/editar/<int:id>', methods=['GET', 'POST'])
def editar(id):
    conn = get_db()
    cursor = conn.cursor()

    if request.method == 'POST':
        titulo = request.form['titulo']
        descricao = request.form['descricao']
        solicitante = request.form['solicitante']

        cursor.execute(
            "UPDATE demandas SET titulo = ?, descricao = ?, solicitante = ? WHERE id = ?",
            (titulo, descricao, solicitante, id),
        )
        conn.commit()
        conn.close()
        return redirect('/')

    demanda = cursor.execute('SELECT * FROM demandas WHERE id = ?', (id,)).fetchone()
    conn.close()
    if demanda is None:
        abort(404)
    return render_template('editar.html', demanda=demanda)


@app.route('/deletar/<int:id>')
def deletar(id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM demandas WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    flash('Deletado!')
    return redirect('/')


@app.route('/buscar')
def buscar():
    termo = request.args.get('q', '')
    conn = get_db()
    cursor = conn.cursor()
    resultados = cursor.execute(
        'SELECT * FROM demandas WHERE titulo LIKE ?',
        (f'%{termo}%',),
    ).fetchall()
    conn.close()
    return render_template('index.html', demandas=resultados)


# @app.route('/admin')
# def admin():
#     return 'Área administrativa'

@app.route('/detalhes/<int:id>')
def detalhes(id):
    conn = get_db()
    cursor = conn.cursor()
    demanda = cursor.execute('SELECT * FROM demandas WHERE id = ?', (id,)).fetchone()

    comentarios = cursor.execute(
        'SELECT * FROM comentarios WHERE demanda_id = ?',
        (id,),
    ).fetchall()
    conn.close()
    if demanda is None:
        abort(404)

    return render_template('detalhes.html', demanda=demanda, comentarios=comentarios)


@app.route('/adicionar_comentario/<int:demanda_id>', methods=['POST'])
def adicionar_comentario(demanda_id):
    comentario = request.form['comentario']
    autor = request.form['autor']

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO comentarios (demanda_id, comentario, autor, data) VALUES (?, ?, ?, ?)",
        (demanda_id, comentario, autor, datetime.now()),
    )
    conn.commit()
    conn.close()

    return redirect(f'/detalhes/{demanda_id}')


def calcular_prazo(data_inicio):
    return "30 dias"


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0') 