# Use official Python image
FROM python:3.10-slim

# Environment settings
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set working directory
WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && apt-get clean

# Copy requirement file and install
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy project code
COPY . .

# Expose port
EXPOSE 8000

# Optional: collect static files (if needed)
# RUN python manage.py collectstatic --noinput

# Run server
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
