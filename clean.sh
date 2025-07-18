#!/bin/bash

uvx ruff check --select I --fix src/
uvx ruff format src/

# isort src/
# black src/

air format R/
