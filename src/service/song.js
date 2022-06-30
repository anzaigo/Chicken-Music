import { get } from './base'

export function processSongs(songs) {
    if (!songs.length) {
        return Promise.resolve(songs)
    }

    return get('/api/getSongsUrl', {
        mid: songs.map((song) => {
            return song.mid
        })
    }).then((result) => {
        const map = result.map
        return songs.map((song) => {
            song.url = map[song.mid]
            return song
        }).filter((song) => {
            return song.url && song.url.indexOf('vkey') > -1 // song.url不加搜索功能可能会有bug
        })
    })
}

// 歌词
const lyricMap = {} // 用来缓存歌词(性能优化)

export function getLyric(song) {
    if (song.lyric) { // 如果歌词存在，则直接返回，不在访问服务器请求该歌词
        return Promise.resolve(song.lyric)
    }
    const mid = song.mid
    const lyric = lyricMap[mid]
    if (lyric) { // 如果歌词存在，则返回，不在访问服务器请求该歌词
        return Promise.resolve(lyric)
    }

    return get('/api/getLyric', {
        mid
    }).then((result) => {
        const lyric = result ? result.lyric : '[00:00:00]该歌曲暂时无法获取歌词'
        lyricMap[mid] = lyric // 将歌词添加到lyricMap的mid中
        return lyric
    })
}
