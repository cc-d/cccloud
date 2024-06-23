#!/usr/bin/env python3
import base58 as b58
import sys
import os
import os.path as op


def main():
    for p in sys.argv[1:]:
        dirfiles = os.listdir(p)
        df = []
        for f in dirfiles:
            try:
                df.append(f'{b58.b58decode(f).decode()}')
            except:
                pass
        print('\t'.join(df))


if __name__ == '__main__':
    main()
