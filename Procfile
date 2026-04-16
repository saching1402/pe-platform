web: gunicorn pe_platform.wsgi --workers 2 --bind 0.0.0.0:$PORT
release: python manage.py migrate --noinput && python manage.py seed_data --file data/fund_data.xlsx