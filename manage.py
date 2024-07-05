#!/usr/bin/env python3
import os.path as op
import argparse as ap
import sys
import os
import base58 as b58
import json
import typing as T
from os import urandom
from hashlib import sha256, _Hash
from pyshared import default_repr, truncstr
from hashlib import sha256
from uuid import uuid4, UUID


class User:
    hash: _Hash
    uid: str
    secret: str

    def __init__(
        self,
        secret: str = None,
        uid: str = None,

    ):
        if uid is None and secret is None:
            self.secret = sha256(urandom(8))
        elif uid is None:
            self.secret = secret
            self.hash = sha256(secret.encode() if isinstance(secret, str) else secret)
            self.uid = self.hash.hexdigest()

    @property
    def uid(self):
        return self.hash.hexdigest()


    def __repr__(self):
        return default_repr(self)

    __str__ = __repr__


class Users:
    users: dict

    def __init__(self, path: str):
        self.path = path

    def get_users(_)

    def _load_file(self) -> dict:
        with open(self.path, 'r') as f:
            return json.load(f)

    def add(self, user: T.Optional[User] = None):
        if user is not None:
            self.users[user.uuid] = user
        else:
            user = User(str(uuid4()))
            self.users[user.uuid] = {'uid': user.uid, 'secret': user.secret}
        os.mkdir(
            op.join(op.abspath(op.dirname(__file__)), 'uploads', user.uid)
        )

    def list(self, secret: bool = False):
        for uid, uvals in self.users.items():
            sec = (
                uvals['secret']
                if secret
                else truncstr(uvals['secret'], start_chars=1)
            )
            print(f'User: {uid} {uvals["uid"]} {sec}')

    def __repr__(self):
        return default_repr(self)

    __str__ = __repr__


def main(*args, **kwargs):
    parser = ap.ArgumentParser(description='Manage cccloud')

    pcmd = parser.add_subparsers(
        title='cmd', description='commands', dest='cmd', required=True
    )

    puser = pcmd.add_parser('user', help='manage users')
    useract = puser.add_subparsers(
        title='action', description='user actions', dest='action'
    )

    auser = useract.add_parser('a', aliases=['add'], help='add a user')
    luser = useract.add_parser('l', aliases=['list'], help='list users')
    luser.add_argument(
        '-s', '--secret', action='store_true', help='show user secrets'
    )
    nspace = parser.parse_args(*args, **kwargs)

    users = Users(op.join(op.abspath(op.dirname(__file__)), 'users.json'))

    if nspace.cmd == 'user':
        if nspace.action is None:
            parser.print_help()
        elif nspace.action.startswith('a'):
            users.add()
        elif nspace.action.startswith('l'):
            users.list(nspace.secret)


if __name__ == '__main__':
    main(sys.argv[1:])
