package com.JJP.restapiserver.domain.dto.challenge;

import com.JJP.restapiserver.domain.entity.challenge.Review;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class ReviewResponseDto {
    private Long id;

    private Writer writer;
    private String content;
    private int rate;
    private LocalDateTime createdTime;
    private LocalDateTime modifiedTime;
    public ReviewResponseDto(Review review)
    {
        this.id = review.getId();
        this.writer = new Writer(review.getMember().getId(), review.getMember().getNickname(), review.getMember().getUser_img(), review.getMember().getMemberScore().getScore());
        this.content = review.getReview_content();
        this.rate = review.getRate();
        this.createdTime = review.getCreatedDate();
        this.modifiedTime = review.getModifiedDate();
    }
}
