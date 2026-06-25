arr = [1, 2, 3, 5, 6, 7, 10, 11, 12]

start = arr[0]
previous = arr[0]
ranges = []

for i in arr:
    if start not in ranges:
        ranges.append(start)
    current = i
    if (current - previous > 1):
        ranges.append(previous)
        start = current
        ranges.append(start)
    previous = current
    
print(ranges)
